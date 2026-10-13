// 실행: npx vite-node scripts/make-samples.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { run } from '../src/core/commands';
import { exportJson } from '../src/core/io';
import { initialState } from '../src/core/logic';
import type { AppState } from '../src/core/types';

let t = Date.UTC(2026, 0, 1, 3, 0, 0);
const ctx = { now: () => (t += 60_000) };
const go = (s: AppState, id: string, arg?: string | number) => run(s, id, arg, ctx).state;
const out = (name: string, s: AppState, extra: Record<string, unknown> = {}) => {
  const j = JSON.parse(exportJson(s.data));
  writeFileSync(`samples/${name}.hankkikok.json`, JSON.stringify({ ...j, ...extra }, null, 2) + '\n');
};
mkdirSync('samples', { recursive: true });

out('empty', initialState());

let s = initialState();
// o1: 완료 + 리뷰
s = go(s, 'cart.add', 's1m1'); s = go(s, 'cart.inc', 's1m1'); s = go(s, 'order.place');
for (let i = 0; i < 3; i++) s = go(s, 'order.advance', 'o1');
s = go(s, 'review.submit', 'o1|5|맛있어요');
// o2: 진행 중
s = go(s, 'cart.add', 's4m1'); s = go(s, 'order.place'); s = go(s, 'order.advance', 'o2');
// o3: 취소
s = go(s, 'cart.add', 's6m1'); s = go(s, 'cart.add', 's6m2'); s = go(s, 'order.place'); s = go(s, 'order.cancel', 'o3');
s = go(s, 'store.favorite', 's1'); s = go(s, 'store.favorite', 's7');
out('with-orders', s);

let u = initialState();
u = go(u, 'address.set', '서울시 마포구 "홍대" 로 1, 101동 🏠');
u = go(u, 'request.set', '벨 누르지 말고 문 앞에 "살짝" 놔주세요 🙏 수저 빼고, 매운맛 🌶️🌶️');
u = go(u, 'cart.add', 's1m1'); u = go(u, 'cart.inc', 's1m1'); u = go(u, 'order.place');
for (let i = 0; i < 3; i++) u = go(u, 'order.advance', 'o1');
u = go(u, 'review.submit', 'o1|4|"제육" 최고 👍\n다음에 또 올게요, 쉼표도 OK');
out('unicode', u);

out('unknown-fields', s, { x_custom: { memo: '보존돼야 함', n: [1, 2, { k: '한글' }], flag: true }, x_other: null });
console.log('samples 4개 생성');
