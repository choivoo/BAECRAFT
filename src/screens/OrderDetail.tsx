import '../ui/styles2.css';
import { useApp } from '../ui/store';
import { STATUS_FLOW } from '../core/types';

export default function OrderDetail({ orderId }: { orderId: string }) {
  const { state, run } = useApp();
  const o = state.data.orders.find(x => x.id === orderId);
  if (!o) return <div className="s2-empty">주문을 찾을 수 없어요.</div>;
  const rv = state.data.reviews.find(r => r.orderId === o.id);
  const idx = STATUS_FLOW.indexOf(o.status);
  return (
    <div>
      <h2 className="s2-h">{o.storeName}</h2>
      {o.status === '취소' ? <p><span className="s2-badge x">주문 취소됨</span></p> : (
        <ol className="s2-prog" aria-label="주문 진행 상태">
          {STATUS_FLOW.map((st, i) => <li key={st} className={i <= idx ? 'on' : ''}>{st}</li>)}
        </ol>
      )}
      <ul className="s2-list">
        {o.lines.map(l => <li key={l.menuId} className="s2-row"><span>{l.name} x{l.qty}</span><span>{(l.price * l.qty).toLocaleString()}원</span></li>)}
      </ul>
      <p className="s2-row s2-mu"><span>상품 금액</span><span>{o.itemsTotal.toLocaleString()}원</span></p>
      <p className="s2-row s2-mu"><span>배달비</span><span>{o.fee.toLocaleString()}원</span></p>
      <p className="s2-row"><b>합계</b><b>{o.total.toLocaleString()}원</b></p>
      <p className="s2-mu">배달 주소: {o.address}</p>
      {o.request && <p className="s2-mu">요청사항: {o.request}</p>}
      {rv && <div className="s2-card"><b>{'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}</b><span>{rv.text}</span></div>}
      <div className="s2-btns">
        {idx >= 0 && idx < STATUS_FLOW.length - 1 && <button className="s2-btn pri" aria-label="다음 단계로 (데모)" onClick={() => run('order.advance', o.id)}>다음 단계로(데모)</button>}
        {o.status === '접수' && <button className="s2-btn danger" aria-label="주문 취소" onClick={() => run('order.cancel', o.id)}>주문 취소</button>}
        <button className="s2-btn" aria-label="같은 메뉴 재주문" onClick={() => run('order.reorder', o.id)}>같은 메뉴 재주문</button>
        {o.status === '완료' && !rv && <button className="s2-btn pri" aria-label="리뷰 쓰기" onClick={() => run('review.open', o.id)}>리뷰 쓰기</button>}
      </div>
    </div>
  );
}
