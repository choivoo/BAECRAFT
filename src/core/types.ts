export interface Menu { id: string; name: string; price: number; desc?: string }
export interface Store {
  id: string; name: string; category: string; rating: number; reviewCount: number;
  minOrder: number; deliveryFee: number; etaMin: number; emoji: string; menus: Menu[];
}
export interface CartLine { menuId: string; qty: number }
export interface Cart { storeId: string | null; lines: CartLine[] }
export type OrderStatus = '접수' | '조리중' | '배달중' | '완료' | '취소';
export const STATUS_FLOW: OrderStatus[] = ['접수', '조리중', '배달중', '완료'];
export interface OrderLine { menuId: string; name: string; price: number; qty: number }
export interface Order {
  id: string; storeId: string; storeName: string; lines: OrderLine[];
  itemsTotal: number; fee: number; total: number; status: OrderStatus;
  placedAt: number; address: string; request: string;
}
export interface Review { id: string; orderId: string; storeId: string; rating: number; text: string; at: number }
/** 되돌리기 대상(문서) 데이터. extra 는 모르는 필드를 그대로 보존한다. */
export interface Data {
  stores: Store[]; cart: Cart; orders: Order[]; favorites: string[];
  reviews: Review[]; address: string; request: string; extra: Record<string, unknown>;
}
export type Tab = 'home' | 'search' | 'orders' | 'favorites' | 'my';
export type Screen = { kind: 'store'; storeId: string } | { kind: 'cart' } | { kind: 'order'; orderId: string } | { kind: 'review'; orderId: string };
export type Sort = 'recommend' | 'rating' | 'eta' | 'fee';
export interface View { tab: Tab; stack: Screen[]; query: string; category: string; sort: Sort; toast: string }
export interface AppState { data: Data; view: View; past: Data[]; future: Data[]; lastEdit?: string }
