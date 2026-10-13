import type { Data } from './types';
import { emptyData } from './logic';

export const FORMAT = 'hankkikok/1';
const KNOWN = ['format', 'stores', 'cart', 'orders', 'favorites', 'reviews', 'address', 'request'];

/** 공개 형식: UTF-8 JSON. 모르는 최상위 필드는 extra 로 보존했다가 그대로 되돌려 쓴다. */
export function importJson(text: string): Data {
  const raw = JSON.parse(text);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('JSON 객체가 아니에요');
  if (raw.format !== FORMAT) throw new Error(`format 이 ${FORMAT} 이(가) 아니에요`);
  const base = emptyData();
  const extra: Record<string, unknown> = {};
  for (const k of Object.keys(raw)) if (!KNOWN.includes(k)) extra[k] = raw[k];
  return {
    stores: raw.stores ?? base.stores, cart: raw.cart ?? base.cart, orders: raw.orders ?? [],
    favorites: raw.favorites ?? [], reviews: raw.reviews ?? [], address: raw.address ?? '', request: raw.request ?? '', extra,
  };
}
export function exportJson(d: Data): string {
  return JSON.stringify({ format: FORMAT, address: d.address, request: d.request, stores: d.stores, cart: d.cart,
    orders: d.orders, favorites: d.favorites, reviews: d.reviews, ...d.extra }, null, 2) + '\n';
}
const q = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
/** 주문내역 CSV (엑셀 한글 호환을 위해 BOM 포함) */
export function exportCsv(d: Data): string {
  const head = ['주문번호', '가게', '메뉴', '상품금액', '배달비', '합계', '상태', '주문시각', '주소'];
  const rows = d.orders.map(o => [o.id, o.storeName, o.lines.map(l => `${l.name}x${l.qty}`).join(' / '),
    o.itemsTotal, o.fee, o.total, o.status, new Date(o.placedAt).toISOString(), o.address].map(q).join(','));
  return '﻿' + [head.map(q).join(','), ...rows].join('\r\n') + '\r\n';
}
