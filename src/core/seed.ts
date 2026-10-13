import type { Store } from './types';
const m = (id: string, name: string, price: number, desc = '') => ({ id, name, price, desc });
export const CATEGORIES = ['전체', '한식', '중식', '일식', '치킨', '피자', '분식', '카페'];
export const SEED_STORES: Store[] = [
  { id: 's1', name: '든든한상 백반', category: '한식', rating: 4.8, reviewCount: 312, minOrder: 9000, deliveryFee: 1500, etaMin: 25, emoji: '🍚',
    menus: [m('s1m1', '제육볶음 정식', 9500, '매콤한 제육과 반찬 4종'), m('s1m2', '된장찌개 정식', 8500), m('s1m3', '계란말이', 5000)] },
  { id: 's2', name: '홍룡반점', category: '중식', rating: 4.5, reviewCount: 201, minOrder: 12000, deliveryFee: 2000, etaMin: 35, emoji: '🥢',
    menus: [m('s2m1', '짜장면', 7000), m('s2m2', '짬뽕', 8500), m('s2m3', '탕수육(소)', 15000, '바삭한 찹쌀 튀김')] },
  { id: 's3', name: '스시한점', category: '일식', rating: 4.7, reviewCount: 158, minOrder: 15000, deliveryFee: 3000, etaMin: 40, emoji: '🍣',
    menus: [m('s3m1', '모둠초밥 10p', 16000), m('s3m2', '연어덮밥', 12000), m('s3m3', '우동', 6500)] },
  { id: 's4', name: '바삭바삭 치킨', category: '치킨', rating: 4.6, reviewCount: 540, minOrder: 17000, deliveryFee: 2500, etaMin: 45, emoji: '🍗',
    menus: [m('s4m1', '후라이드', 18000), m('s4m2', '양념치킨', 19000), m('s4m3', '치즈볼', 5000)] },
  { id: 's5', name: '화덕피자 모아', category: '피자', rating: 4.4, reviewCount: 97, minOrder: 16000, deliveryFee: 2000, etaMin: 38, emoji: '🍕',
    menus: [m('s5m1', '마르게리타', 14500), m('s5m2', '페퍼로니', 16500), m('s5m3', '콜라 1.25L', 2500)] },
  { id: 's6', name: '떡볶이 놀이터', category: '분식', rating: 4.3, reviewCount: 420, minOrder: 8000, deliveryFee: 1000, etaMin: 20, emoji: '🌶️',
    menus: [m('s6m1', '떡볶이', 5000), m('s6m2', '순대', 4500), m('s6m3', '김말이 튀김', 3500)] },
  { id: 's7', name: '달콤 카페', category: '카페', rating: 4.9, reviewCount: 75, minOrder: 7000, deliveryFee: 1500, etaMin: 15, emoji: '☕',
    menus: [m('s7m1', '아메리카노', 3500), m('s7m2', '카페라떼', 4200), m('s7m3', '치즈케이크', 5800)] },
];
