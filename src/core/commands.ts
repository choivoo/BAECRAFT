import type { AppState, Data, Tab, Screen, Sort } from './types';
import { cartSummary, initialState, nextStatus, storeOf } from './logic';
import { exportJson, exportCsv, importJson } from './io';

export interface Ctx { now: () => number }
export type Arg = string | number | undefined;
export interface Result { state: AppState; output?: string }
type Fn = (s: AppState, arg: Arg, ctx: Ctx) => Result | AppState;

const HISTORY_MAX = 100;
const toast = (s: AppState, t: string): AppState => ({ ...s, view: { ...s.view, toast: t } });
/** 문서 데이터를 바꾸는 명령: 되돌리기 기록을 남긴다 */
function edit(s: AppState, f: (d: Data) => Data, msg = '', merge?: string): AppState {
  const data = f(s.data);
  if (data === s.data) return s;
  // 같은 입력칸을 연속 타이핑하면 되돌리기 한 단계로 합친다
  if (merge && s.lastEdit === merge) return { ...s, data, future: [], lastEdit: merge, view: { ...s.view, toast: msg } };
  return { ...s, lastEdit: merge, data, past: [...s.past, s.data].slice(-HISTORY_MAX), future: [], view: { ...s.view, toast: msg } };
}
const push = (s: AppState, sc: Screen): AppState => ({ ...s, view: { ...s.view, stack: [...s.view.stack, sc], toast: '' } });
const tab = (t: Tab): Fn => s => ({ ...s, view: { ...s.view, tab: t, stack: [], toast: '' } });

function addToCart(s: AppState, menuId: string, delta: number): AppState {
  const store = s.data.stores.find(st => st.menus.some(m => m.id === menuId));
  if (!store) return s;
  return edit(s, d => {
    let cart = d.cart; let msg = '';
    if (cart.storeId !== store.id) { cart = { storeId: store.id, lines: [] }; }
    const found = cart.lines.find(l => l.menuId === menuId);
    let lines = found ? cart.lines.map(l => l.menuId === menuId ? { ...l, qty: l.qty + delta } : l)
      : delta > 0 ? [...cart.lines, { menuId, qty: delta }] : cart.lines;
    lines = lines.filter(l => l.qty > 0);
    if (!lines.length) cart = { storeId: null, lines: [] }; else cart = { storeId: store.id, lines };
    void msg;
    return { ...d, cart };
  });
}

export const COMMANDS: Record<string, Fn> = {
  'nav.home': tab('home'), 'nav.search': tab('search'), 'nav.orders': tab('orders'),
  'nav.favorites': tab('favorites'), 'nav.my': tab('my'),
  'nav.stay': s => s.view.toast ? toast(s, '') : s,
  'nav.back': s => ({ ...s, view: { ...s.view, stack: s.view.stack.slice(0, -1), toast: '' } }),
  'store.open': (s, a) => storeOf(s.data, String(a)) ? push(s, { kind: 'store', storeId: String(a) }) : s,
  'cart.open': s => push(s, { kind: 'cart' }),
  'order.view': (s, a) => push(s, { kind: 'order', orderId: String(a) }),
  'review.open': (s, a) => push(s, { kind: 'review', orderId: String(a) }),
  'search.query': (s, a) => ({ ...s, view: { ...s.view, query: String(a ?? '') } }),
  'search.category': (s, a) => ({ ...s, view: { ...s.view, category: String(a ?? '전체') } }),
  'search.sort': (s, a) => ({ ...s, view: { ...s.view, sort: (String(a) as Sort) } }),
  'store.favorite': (s, a) => edit(s, d => {
    const id = String(a); if (!storeOf(d, id)) return d;
    return { ...d, favorites: d.favorites.includes(id) ? d.favorites.filter(f => f !== id) : [...d.favorites, id] };
  }),
  'cart.add': (s, a) => addToCart(s, String(a), 1),
  'cart.inc': (s, a) => addToCart(s, String(a), 1),
  'cart.dec': (s, a) => addToCart(s, String(a), -1),
  'cart.remove': (s, a) => edit(s, d => {
    const lines = d.cart.lines.filter(l => l.menuId !== String(a));
    return { ...d, cart: lines.length ? { ...d.cart, lines } : { storeId: null, lines: [] } };
  }),
  'cart.clear': s => edit(s, d => d.cart.lines.length ? { ...d, cart: { storeId: null, lines: [] } } : d),
  'order.place': (s, _a, ctx) => {
    const c = cartSummary(s.data);
    if (!c.store || !c.lines.length) return toast(s, '장바구니가 비어 있어요');
    if (c.shortBy > 0) return toast(s, `최소주문금액까지 ${c.shortBy.toLocaleString()}원 남았어요`);
    if (!s.data.address.trim()) return toast(s, '배달 주소를 먼저 입력해 주세요');
    const n = s.data.orders.reduce((m, o) => Math.max(m, Number(o.id.slice(1)) || 0), 0) + 1;
    const id = `o${n}`;
    const next = edit(s, d => ({
      ...d, cart: { storeId: null, lines: [] },
      orders: [...d.orders, { id, storeId: c.store!.id, storeName: c.store!.name,
        lines: c.lines.map(l => ({ menuId: l.menuId, name: l.name, price: l.price, qty: l.qty })),
        itemsTotal: c.itemsTotal, fee: c.fee, total: c.total, status: '접수', placedAt: ctx.now(),
        address: d.address, request: d.request }],
    }), '주문이 접수됐어요');
    return { state: { ...next, view: { ...next.view, tab: 'orders', stack: [{ kind: 'order', orderId: id }] } }, output: id };
  },
  'order.advance': (s, a) => edit(s, d => ({ ...d, orders: d.orders.map(o => o.id === String(a) ? { ...o, status: nextStatus(o.status) } : o) })),
  'order.cancel': (s, a) => edit(s, d => ({ ...d, orders: d.orders.map(o =>
    o.id === String(a) && o.status === '접수' ? { ...o, status: '취소' } : o) }), '주문을 취소했어요'),
  'order.reorder': (s, a) => {
    const o = s.data.orders.find(x => x.id === String(a)); if (!o || !storeOf(s.data, o.storeId)) return s;
    const lines = o.lines.filter(l => storeOf(s.data, o.storeId)!.menus.some(m => m.id === l.menuId)).map(l => ({ menuId: l.menuId, qty: l.qty }));
    const e = edit(s, d => ({ ...d, cart: { storeId: o.storeId, lines } }), '같은 메뉴를 담았어요');
    return push({ ...e, view: { ...e.view, stack: [] } }, { kind: 'cart' });
  },
  'review.submit': (s, a, ctx) => {
    const [oid, rating, ...t] = String(a).split('|');
    const o = s.data.orders.find(x => x.id === oid);
    const r = Math.min(5, Math.max(1, Number(rating) || 5));
    if (!o || o.status !== '완료') return toast(s, '배달이 완료된 주문만 리뷰를 쓸 수 있어요');
    const e = edit(s, d => ({ ...d, reviews: [...d.reviews.filter(x => x.orderId !== oid),
      { id: `r${oid}`, orderId: oid, storeId: o.storeId, rating: r, text: t.join('|'), at: ctx.now() }] }), '리뷰를 남겼어요');
    return { ...e, view: { ...e.view, stack: e.view.stack.slice(0, -1) } };
  },
  'address.set': (s, a) => edit(s, d => d.address === String(a ?? '') ? d : { ...d, address: String(a ?? '') }, '', 'address'),
  'request.set': (s, a) => edit(s, d => d.request === String(a ?? '') ? d : { ...d, request: String(a ?? '') }, '', 'request'),
  'edit.undo': s => {
    if (!s.past.length) return s;
    return { ...s, data: s.past[s.past.length - 1], past: s.past.slice(0, -1), future: [s.data, ...s.future] };
  },
  'edit.redo': s => {
    if (!s.future.length) return s;
    return { ...s, data: s.future[0], future: s.future.slice(1), past: [...s.past, s.data] };
  },
  'data.exportJson': s => ({ state: s, output: exportJson(s.data) }),
  'data.exportCsv': s => ({ state: s, output: exportCsv(s.data) }),
  'data.import': (s, a) => {
    try { const d = importJson(String(a)); return edit(s, () => d, '파일을 열었어요'); }
    catch (e) { return toast(s, '열 수 없는 파일이에요: ' + (e as Error).message); }
  },
  'data.reset': s => ({ ...initialState(), view: s.view }),
};
export const COMMAND_IDS = Object.keys(COMMANDS);

export function run(s: AppState, id: string, arg?: Arg, ctx: Ctx = { now: Date.now }): Result {
  const f = COMMANDS[id]; if (!f) throw new Error('unknown command ' + id);
  const r = f(s, arg, ctx);
  const out = 'state' in r ? r : { state: r };
  if (id !== 'address.set' && id !== 'request.set' && id !== 'nav.stay' && out.state.lastEdit) out.state = { ...out.state, lastEdit: undefined };
  return out;
}

/** 단축키 → 명령. UI 는 이 표만 참조한다. */
export const SHORTCUTS: { keys: string; cmd: string; arg?: string; label: string }[] = [
  { keys: 'Ctrl+Z', cmd: 'edit.undo', label: '되돌리기' },
  { keys: 'Ctrl+Y', cmd: 'edit.redo', label: '다시 실행' },
  { keys: 'Ctrl+Shift+Z', cmd: 'edit.redo', label: '다시 실행' },
  { keys: 'Escape', cmd: 'nav.back', label: '뒤로' },
  { keys: 'Ctrl+K', cmd: 'cart.open', label: '장바구니' },
  { keys: 'Ctrl+1', cmd: 'nav.home', label: '홈' },
  { keys: 'Ctrl+2', cmd: 'nav.search', label: '검색' },
  { keys: 'Ctrl+3', cmd: 'nav.orders', label: '주문내역' },
  { keys: 'Ctrl+4', cmd: 'nav.favorites', label: '찜' },
  { keys: 'Ctrl+5', cmd: 'nav.my', label: '마이' },
];
export function matchShortcut(e: { key: string; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) {
  const ctrl = e.ctrlKey || e.metaKey;
  const k = (ctrl ? 'Ctrl+' : '') + (e.shiftKey && ctrl ? 'Shift+' : '') + (e.key.length === 1 ? e.key.toUpperCase() : e.key);
  return SHORTCUTS.find(x => x.keys === k);
}
