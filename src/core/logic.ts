import type { AppState, Data, Store, Order, OrderStatus } from './types';
import { STATUS_FLOW } from './types';
import { SEED_STORES } from './seed';

export function emptyData(): Data {
  return { stores: SEED_STORES, cart: { storeId: null, lines: [] }, orders: [], favorites: [], reviews: [], address: '서울시 중구 세종대로 110', request: '', extra: {} };
}
export function initialState(data: Data = emptyData()): AppState {
  return { data, view: { tab: 'home', stack: [], query: '', category: '전체', sort: 'recommend', toast: '' }, past: [], future: [] };
}
export const storeOf = (d: Data, id: string | null): Store | undefined => d.stores.find(s => s.id === id);

export function cartSummary(d: Data) {
  const store = storeOf(d, d.cart.storeId);
  const lines = d.cart.lines.flatMap(l => {
    const menu = store?.menus.find(m => m.id === l.menuId);
    return menu ? [{ ...l, name: menu.name, price: menu.price, sum: menu.price * l.qty }] : [];
  });
  const itemsTotal = lines.reduce((a, l) => a + l.sum, 0);
  const fee = lines.length && store ? store.deliveryFee : 0;
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const shortBy = store ? Math.max(0, store.minOrder - itemsTotal) : 0;
  return { store, lines, itemsTotal, fee, total: itemsTotal + fee, count, shortBy };
}

export function filterStores(d: Data, query: string, category: string, sort: string): Store[] {
  const q = query.trim().toLowerCase();
  let r = d.stores.filter(s =>
    (category === '전체' || s.category === category) &&
    (!q || s.name.toLowerCase().includes(q) || s.menus.some(m => m.name.toLowerCase().includes(q))));
  const by: Record<string, (a: Store, b: Store) => number> = {
    rating: (a, b) => b.rating - a.rating, eta: (a, b) => a.etaMin - b.etaMin,
    fee: (a, b) => a.deliveryFee - b.deliveryFee, recommend: (a, b) => b.reviewCount - a.reviewCount,
  };
  r = [...r].sort(by[sort] ?? by.recommend);
  return r;
}

export function nextStatus(s: OrderStatus): OrderStatus {
  const i = STATUS_FLOW.indexOf(s);
  return i < 0 || i === STATUS_FLOW.length - 1 ? s : STATUS_FLOW[i + 1];
}
export const isActive = (o: Order) => o.status !== '완료' && o.status !== '취소';
