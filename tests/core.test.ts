import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { run } from '../src/core/commands';
import { filterStores, initialState, cartSummary } from '../src/core/logic';
import { importJson, exportJson } from '../src/core/io';
import type { AppState } from '../src/core/types';

let clock = 1_700_000_000_000;
const ctx = { now: () => (clock += 1000) };
const go = (s: AppState, id: string, arg?: string | number) => run(s, id, arg, ctx).state;
const place = (s: AppState, menu: string) => { const a = go(s, 'cart.add', menu); return go(a, 'order.place'); };
const finish = (s: AppState, id: string) => [1, 2, 3].reduce(x => go(x, 'order.advance', id), s);
const names = (s: AppState) => filterStores(s.data, s.view.query, s.view.category, s.view.sort);

describe('core', () => {
  it('F1 카테고리를 고르면 해당 카테고리 가게만 보인다', () => {
    const s = go(initialState(), 'search.category', '한식');
    expect(s.view.category).toBe('한식');
    const r = names(s);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every(x => x.category === '한식')).toBe(true);
    expect(names(go(s, 'search.category', '전체')).length).toBe(7);
  });

  it('F2 가게명/메뉴명 일부로 검색한다', () => {
    let s = go(initialState(), 'search.query', '제육');
    expect(names(s).map(x => x.id)).toEqual(['s1']);
    s = go(s, 'search.query', '치킨');
    expect(names(s).map(x => x.id)).toEqual(['s4']);
    expect(names(go(s, 'search.query', '없는검색어zzz'))).toEqual([]);
  });

  it('F3 평점/도착시간/배달비 순 정렬', () => {
    const s0 = initialState();
    const r = names(go(s0, 'search.sort', 'rating')).map(x => x.rating);
    expect(r).toEqual([...r].sort((a, b) => b - a));
    const e = names(go(s0, 'search.sort', 'eta')).map(x => x.etaMin);
    expect(e).toEqual([...e].sort((a, b) => a - b));
    const f = names(go(s0, 'search.sort', 'fee')).map(x => x.deliveryFee);
    expect(f).toEqual([...f].sort((a, b) => a - b));
  });

  it('F4 가게를 열고 뒤로가기로 돌아온다', () => {
    let s = go(initialState(), 'store.open', 's2');
    expect(s.view.stack).toEqual([{ kind: 'store', storeId: 's2' }]);
    const st = s.data.stores.find(x => x.id === 's2')!;
    expect(st.menus.length).toBeGreaterThan(0);
    expect(st.minOrder).toBe(12000); expect(st.deliveryFee).toBe(2000);
    s = go(s, 'nav.back');
    expect(s.view.stack).toEqual([]);
    expect(go(initialState(), 'store.open', 'nope').view.stack).toEqual([]);
  });

  it('F5 담기/증감/삭제가 합계에 반영되고 0개면 삭제', () => {
    let s = go(initialState(), 'cart.add', 's1m1');
    expect(cartSummary(s.data).itemsTotal).toBe(9500);
    s = go(s, 'cart.inc', 's1m1');
    expect(cartSummary(s.data).itemsTotal).toBe(19000);
    s = go(s, 'cart.add', 's1m2');
    expect(cartSummary(s.data).count).toBe(3);
    s = go(s, 'cart.dec', 's1m1'); s = go(s, 'cart.dec', 's1m1');
    expect(s.data.cart.lines.map(l => l.menuId)).toEqual(['s1m2']);
    s = go(s, 'cart.remove', 's1m2');
    expect(s.data.cart).toEqual({ storeId: null, lines: [] });
    s = go(go(s, 'cart.add', 's1m1'), 'cart.clear');
    expect(s.data.cart.lines).toEqual([]);
    expect(go(initialState(), 'cart.dec', 's1m1').data.cart.lines).toEqual([]);
  });

  it('F6 다른 가게 메뉴를 담으면 장바구니가 교체된다', () => {
    let s = go(go(initialState(), 'cart.add', 's1m1'), 'cart.add', 's1m2');
    s = go(s, 'cart.add', 's2m1');
    expect(s.data.cart).toEqual({ storeId: 's2', lines: [{ menuId: 's2m1', qty: 1 }] });
  });

  it('F7 최소주문금액 이상일 때만 주문되고 접수 주문이 생긴다', () => {
    let s = go(initialState(), 'cart.add', 's1m3'); // 5000 < 9000
    const r = run(s, 'order.place', undefined, ctx);
    expect(r.state.data.orders).toHaveLength(0);
    expect(r.state.view.toast).toContain('최소주문금액');
    s = go(s, 'cart.add', 's1m1'); // 14500
    const ok = run(s, 'order.place', undefined, ctx);
    expect(ok.output).toBe('o1');
    const o = ok.state.data.orders[0];
    expect(o.status).toBe('접수');
    expect(o.itemsTotal).toBe(14500); expect(o.fee).toBe(1500); expect(o.total).toBe(16000);
    expect(ok.state.data.cart.lines).toEqual([]);
    expect(go(initialState(), 'order.place').data.orders).toHaveLength(0);
  });

  it('F8 주문 상태가 접수→조리중→배달중→완료로 진행된다', () => {
    let s = place(initialState(), 's4m1');
    const seen = [s.data.orders[0].status];
    for (let i = 0; i < 4; i++) { s = go(s, 'order.advance', 'o1'); seen.push(s.data.orders[0].status); }
    expect(seen).toEqual(['접수', '조리중', '배달중', '완료', '완료']);
  });

  it('F9 접수 상태에서만 취소된다', () => {
    let s = place(initialState(), 's4m1');
    expect(go(s, 'order.cancel', 'o1').data.orders[0].status).toBe('취소');
    s = go(s, 'order.advance', 'o1');
    expect(go(s, 'order.cancel', 'o1').data.orders[0].status).toBe('조리중');
  });

  it('F10 재주문 시 지난 주문 메뉴가 장바구니에 담긴다', () => {
    let s = go(go(initialState(), 'cart.add', 's1m1'), 'cart.inc', 's1m1');
    s = go(s, 'cart.add', 's1m2'); s = go(s, 'order.place');
    const lines = s.data.orders[0].lines.map(l => ({ menuId: l.menuId, qty: l.qty }));
    s = go(s, 'order.reorder', 'o1');
    expect(s.data.cart).toEqual({ storeId: 's1', lines });
    expect(s.view.stack).toEqual([{ kind: 'cart' }]);
  });

  it('F11 완료된 주문에만 별점·글을 남길 수 있다', () => {
    let s = place(initialState(), 's4m1');
    const early = go(s, 'review.submit', 'o1|5|좋아요');
    expect(early.data.reviews).toEqual([]);
    expect(early.view.toast).not.toBe('');
    s = finish(s, 'o1');
    s = go(s, 'review.submit', 'o1|4|맛있어요 | 파이프 포함');
    expect(s.data.reviews).toHaveLength(1);
    expect(s.data.reviews[0]).toMatchObject({ orderId: 'o1', storeId: 's4', rating: 4, text: '맛있어요 | 파이프 포함' });
    expect(go(s, 'review.submit', 'o1|2|수정').data.reviews).toHaveLength(1);
  });

  it('F12 찜을 켜고 끌 수 있다', () => {
    let s = go(initialState(), 'store.favorite', 's3');
    s = go(s, 'store.favorite', 's5');
    expect(s.data.favorites).toEqual(['s3', 's5']);
    s = go(s, 'store.favorite', 's3');
    expect(s.data.favorites).toEqual(['s5']);
    expect(go(s, 'store.favorite', 'nope').data.favorites).toEqual(['s5']);
  });

  it('F13 주소·요청사항(한글 포함)이 주문에 기록된다', () => {
    let s = go(initialState(), 'address.set', '부산시 해운대구 달맞이길 30');
    s = go(s, 'request.set', '문 앞에 놔주세요 "벨 X" 🙏');
    s = place(s, 's1m1'); // 9500 >= 9000
    expect(s.data.orders[0].address).toBe('부산시 해운대구 달맞이길 30');
    expect(s.data.orders[0].request).toBe('문 앞에 놔주세요 "벨 X" 🙏');
  });

  it('F14 모든 편집 명령이 undo/redo 로 정확히 복원된다', () => {
    const base = place(initialState(), 's4m1');       // o1 접수
    const withDone = (() => { let s = go(go(initialState(), 'cart.add', 's6m1'), 'cart.add', 's6m2'); s = go(s, 'order.place'); return finish(s, 'o1'); })();
    const cartBase = go(initialState(), 'cart.add', 's1m1');
    const cases: [string, AppState, string, string?][] = [
      ['cart.add', initialState(), 'cart.add', 's1m1'],
      ['cart.inc', cartBase, 'cart.inc', 's1m1'],
      ['cart.dec', go(cartBase, 'cart.inc', 's1m1'), 'cart.dec', 's1m1'],
      ['cart.remove', cartBase, 'cart.remove', 's1m1'],
      ['cart.clear', cartBase, 'cart.clear'],
      ['order.place', cartBase, 'order.place'],
      ['order.advance', base, 'order.advance', 'o1'],
      ['order.cancel', base, 'order.cancel', 'o1'],
      ['order.reorder', base, 'order.reorder', 'o1'],
      ['review.submit', withDone, 'review.submit', 'o1|5|굿'],
      ['store.favorite', initialState(), 'store.favorite', 's1'],
      ['address.set', initialState(), 'address.set', '새 주소 한글'],
      ['request.set', initialState(), 'request.set', '요청 🙏'],
    ];
    for (const [name, s0, id, arg] of cases) {
      const s1 = go(s0, id, arg);
      expect(s1.data, `${name} 이 데이터를 바꿔야 함`).not.toEqual(s0.data);
      const u = go(s1, 'edit.undo');
      expect(u.data, `${name} undo`).toEqual(s0.data);
      const r = go(u, 'edit.redo');
      expect(r.data, `${name} redo`).toEqual(s1.data);
    }
  });

  it('F14 연속 편집 전체를 거꾸로 되돌리고 다시 실행한다', () => {
    let s = initialState(); const snaps = [s.data];
    for (const [id, arg] of [['cart.add', 's1m1'], ['cart.inc', 's1m1'], ['address.set', '주소2'], ['request.set', '요청'],
      ['order.place', undefined], ['store.favorite', 's2'], ['order.advance', 'o1'], ['order.cancel', 'o1']] as const) {
      s = go(s, id, arg); snaps.push(s.data);
    }
    const end = s.data;
    for (let i = snaps.length - 2; i >= 0; i--) { s = go(s, 'edit.undo'); expect(s.data).toEqual(snaps[i]); }
    for (let i = 1; i < snaps.length; i++) { s = go(s, 'edit.redo'); expect(s.data).toEqual(snaps[i]); }
    expect(s.data).toEqual(end);
    expect(go(go(s, 'edit.undo'), 'cart.add', 's1m1').future).toEqual([]);
  });

  it('F15 samples 전체 import→export→import 동일, export 문자열 안정, x_custom 보존', () => {
    const files = readdirSync('samples').filter(f => f.endsWith('.hankkikok.json'));
    expect(files.sort()).toEqual(['empty', 'unicode', 'unknown-fields', 'with-orders'].map(n => `${n}.hankkikok.json`));
    for (const f of files) {
      const text = readFileSync(`samples/${f}`, 'utf8');
      const d1 = importJson(text);
      const e1 = exportJson(d1);
      const d2 = importJson(e1);
      const e2 = exportJson(d2);
      expect(d2, f).toEqual(d1);
      expect(e2, f).toBe(e1);
      expect(JSON.parse(e1), f).toEqual(JSON.parse(text));
      // 앱 경로(data.import)로도 동일
      const s = go(initialState(), 'data.import', text);
      expect(s.data, f).toEqual(d1);
      expect(run(s, 'data.exportJson').output, f).toBe(e1);
    }
    const u = importJson(readFileSync('samples/unknown-fields.hankkikok.json', 'utf8'));
    expect(u.extra.x_custom).toEqual({ memo: '보존돼야 함', n: [1, 2, { k: '한글' }], flag: true });
    expect(JSON.parse(exportJson(u)).x_custom).toEqual(u.extra.x_custom);
    expect(go(initialState(), 'data.import', '{"format":"x"}').view.toast).toContain('열 수 없는');
    expect(go(initialState(), 'data.import', 'not json').data).toEqual(initialState().data);
  });

  it('F16 주문이 CSV(한글 BOM)로 내보내진다', () => {
    const d = importJson(readFileSync('samples/with-orders.hankkikok.json', 'utf8'));
    const csv = run(go(initialState(), 'data.import', exportJson(d)), 'data.exportCsv').output!;
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const lines = csv.slice(1).split('\r\n').filter(Boolean);
    expect(lines[0]).toBe('"주문번호","가게","메뉴","상품금액","배달비","합계","상태","주문시각","주소"');
    expect(lines).toHaveLength(1 + d.orders.length);
    expect(lines[1]).toContain('제육볶음 정식x2');
    expect(csv).toContain('"취소"');
    const q = go(initialState(), 'address.set', '큰"따옴표" 주소');
    const c2 = run(place(q, 's1m1'), 'data.exportCsv').output!;
    expect(c2).toContain('"큰""따옴표"" 주소"');
  });
});

describe('F14b 연속 입력 합치기', () => {
  it('주소를 여러 글자 입력해도 Ctrl+Z 한 번에 원래대로', async () => {
    const { run } = await import('../src/core/commands');
    const { initialState } = await import('../src/core/logic');
    let s = initialState(); const orig = s.data.address;
    for (const v of ['ㅅ', '서', '서울']) s = run(s, 'address.set', v).state;
    expect(s.data.address).toBe('서울');
    s = run(s, 'edit.undo').state; expect(s.data.address).toBe(orig);
    s = run(s, 'edit.redo').state; expect(s.data.address).toBe('서울');
  });
});
