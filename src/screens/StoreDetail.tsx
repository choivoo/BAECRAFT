import { useApp } from '../ui/store';
import { cartSummary, storeOf } from '../core/logic';

export default function StoreDetail({ storeId }: { storeId: string }) {
  const { state, run } = useApp();
  const store = storeOf(state.data, storeId);
  if (!store) return <p className="sd-empty">가게를 찾을 수 없어요</p>;
  const fav = state.data.favorites.includes(store.id);
  const c = cartSummary(state.data);
  const qtyOf = (id: string) => state.data.cart.lines.find(l => l.menuId === id)?.qty ?? 0;
  return (
    <div className="sd-wrap">
      <div className="sd-head">
        <span className="sd-emoji" aria-hidden="true">{store.emoji}</span>
        <div className="sd-title">
          <b className="sd-name">{store.name}</b>
          <span className="sd-meta">⭐ {store.rating.toFixed(1)} ({store.reviewCount.toLocaleString()}) · {store.etaMin}분</span>
          <span className="sd-meta">배달비 {store.deliveryFee.toLocaleString()}원 · 최소주문 {store.minOrder.toLocaleString()}원</span>
        </div>
        <button className="sd-heart" aria-label={fav ? '찜 해제' : '찜하기'} aria-pressed={fav}
          onClick={() => run('store.favorite', store.id)}>{fav ? '❤️' : '🤍'}</button>
      </div>
      <ul className="sd-menus">
        {store.menus.map(m => {
          const q = qtyOf(m.id);
          return (
            <li key={m.id} className="sd-menu">
              <div className="sd-mi">
                <b>{m.name}</b>
                {m.desc && <span className="sd-desc">{m.desc}</span>}
                <span className="sd-price">{m.price.toLocaleString()}원</span>
              </div>
              {q > 0 && <span className="sd-qty" aria-label={`${m.name} 담긴 수량`}>{q}</span>}
              <button className="sd-add" aria-label={`${m.name} 담기`} onClick={() => run('cart.add', m.id)}>담기</button>
            </li>
          );
        })}
      </ul>
      {c.count > 0 && c.store?.id === store.id && (
        <button className="sd-bar" aria-label="장바구니 보기" onClick={() => run('cart.open')}>
          장바구니 보기 · {c.count}개 · {c.itemsTotal.toLocaleString()}원
        </button>
      )}
    </div>
  );
}
