import { useApp } from '../ui/store';
import { CATEGORIES } from '../core/seed';
import { filterStores } from '../core/logic';
import type { Store } from '../core/types';

export function StoreCard({ s, prefix }: { s: Store; prefix: string }) {
  const { run } = useApp();
  return (
    <button className="hm-card" aria-label={`${prefix}-${s.name}`} onClick={() => run('store.open', s.id)}>
      <span className="hm-emoji" aria-hidden="true">{s.emoji}</span>
      <span className="hm-info">
        <b className="hm-name">{s.name}</b>
        <span className="hm-meta">⭐ {s.rating.toFixed(1)} ({s.reviewCount.toLocaleString()})</span>
        <span className="hm-meta">{s.etaMin}분 · 배달비 {s.deliveryFee.toLocaleString()}원 · 최소 {s.minOrder.toLocaleString()}원</span>
      </span>
    </button>
  );
}

export default function Home() {
  const { state, run } = useApp();
  const { query, category, sort } = state.view;
  const list = filterStores(state.data, query, category, sort);
  return (
    <div className="hm-wrap">
      <div className="hm-chips" role="tablist" aria-label="카테고리">
        {CATEGORIES.map(c => (
          <button key={c} className={'hm-chip' + (c === category ? ' on' : '')} aria-label={`카테고리 ${c}`}
            aria-pressed={c === category} onClick={() => run('search.category', c)}>{c}</button>
        ))}
      </div>
      <div className="hm-bar">
        <span className="hm-count">{list.length}개 가게</span>
        <select className="hm-sort" aria-label="정렬" value={sort} onChange={e => run('search.sort', e.target.value)}>
          <option value="recommend">추천순</option><option value="rating">평점순</option>
          <option value="eta">배달시간순</option><option value="fee">배달비순</option>
        </select>
      </div>
      {list.length === 0 && <p className="hm-empty">조건에 맞는 가게가 없어요</p>}
      <div className="hm-list">{list.map(s => <StoreCard key={s.id} s={s} prefix="가게" />)}</div>
    </div>
  );
}
