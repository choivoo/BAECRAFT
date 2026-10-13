import '../ui/styles2.css';
import { useApp } from '../ui/store';
import { isActive } from '../core/logic';
import type { Order } from '../core/types';

export const summary = (o: Order) => {
  const f = o.lines[0]; if (!f) return '메뉴 없음';
  return o.lines.length > 1 ? `${f.name} 외 ${o.lines.length - 1}개` : `${f.name} ${f.qty}개`;
};
export default function Orders() {
  const { state, run } = useApp();
  const all = [...state.data.orders].reverse();
  const card = (o: Order) => (
    <li key={o.id}>
      <button className="s2-card" aria-label={`${o.storeName} 주문 상세 보기`} onClick={() => run('order.view', o.id)}>
        <span className="s2-row"><b>{o.storeName}</b><span className={'s2-badge' + (o.status === '취소' ? ' x' : isActive(o) ? ' on' : '')}>{o.status}</span></span>
        <span className="s2-mu">{summary(o)}</span>
        <b>{o.total.toLocaleString()}원</b>
      </button>
    </li>
  );
  const act = all.filter(isActive), past = all.filter(o => !isActive(o));
  if (!all.length) return <div className="s2-empty">아직 주문 내역이 없어요.<br />마음에 드는 가게에서 첫 주문을 해 보세요!</div>;
  return (
    <div>
      <h2 className="s2-h">진행 중</h2>
      {act.length ? <ul className="s2-list">{act.map(card)}</ul> : <p className="s2-mu">진행 중인 주문이 없어요.</p>}
      <h2 className="s2-h">지난 주문</h2>
      {past.length ? <ul className="s2-list">{past.map(card)}</ul> : <p className="s2-mu">지난 주문이 없어요.</p>}
    </div>
  );
}
