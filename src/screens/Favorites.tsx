import '../ui/styles2.css';
import { useApp } from '../ui/store';

export default function Favorites() {
  const { state, run } = useApp();
  const list = state.data.favorites.flatMap(id => state.data.stores.filter(s => s.id === id));
  if (!list.length) return <div className="s2-empty">찜한 가게가 없어요.<br />가게 상세에서 하트를 눌러 보세요.</div>;
  return (
    <ul className="s2-list">
      {list.map(s => (
        <li key={s.id} className="s2-row">
          <button className="s2-card" aria-label={`${s.name} 열기`} onClick={() => run('store.open', s.id)}>
            <b>{s.emoji} {s.name}</b>
            <span className="s2-mu">★ {s.rating} · {s.etaMin}분 · 배달비 {s.deliveryFee.toLocaleString()}원</span>
          </button>
          <button className="s2-btn" aria-label={`${s.name} 찜 해제`} onClick={() => run('store.favorite', s.id)}>💚</button>
        </li>
      ))}
    </ul>
  );
}
