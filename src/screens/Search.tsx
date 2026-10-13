import { useApp } from '../ui/store';
import { filterStores } from '../core/logic';
import { StoreCard } from './Home';

export default function Search() {
  const { state, run } = useApp();
  const { query } = state.view;
  const list = filterStores(state.data, query, '전체', 'recommend');
  return (
    <div className="sr-wrap">
      <input className="sr-input" aria-label="검색어" type="search" placeholder="가게·메뉴 검색"
        value={query} onChange={e => run('search.query', e.target.value)} />
      {query.trim() === '' && <p className="sr-hint">가게 이름이나 메뉴를 검색해 보세요</p>}
      {query.trim() !== '' && list.length === 0 && <p className="sr-hint">검색 결과가 없어요</p>}
      <div className="sr-list">{list.map(s => <StoreCard key={s.id} s={s} prefix="결과" />)}</div>
    </div>
  );
}
