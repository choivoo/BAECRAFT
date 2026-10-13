import { useApp } from '../ui/store';
import { cartSummary } from '../core/logic';

export default function Cart() {
  const { state, run } = useApp();
  const c = cartSummary(state.data);
  if (!c.store || c.lines.length === 0) {
    return (
      <div className="ct-empty">
        <div className="ct-empty-icon" aria-hidden="true">🛒</div>
        <p>장바구니가 비어 있어요</p>
        <button className="ct-go" aria-label="가게 둘러보기" onClick={() => run('nav.home')}>가게 둘러보기</button>
      </div>
    );
  }
  const n = (v: number) => v.toLocaleString() + '원';
  return (
    <div className="ct-wrap">
      <div className="ct-head">
        <b>{c.store.emoji} {c.store.name}</b>
        <button className="ct-clear" aria-label="전체 비우기" onClick={() => run('cart.clear')}>전체 비우기</button>
      </div>
      <ul className="ct-lines">
        {c.lines.map(l => (
          <li key={l.menuId} className="ct-line">
            <div className="ct-li"><b>{l.name}</b><span>{n(l.sum)}</span></div>
            <div className="ct-qty">
              <button aria-label={`${l.name} 수량 줄이기`} onClick={() => run('cart.dec', l.menuId)}>−</button>
              <span aria-label={`${l.name} 수량`}>{l.qty}</span>
              <button aria-label={`${l.name} 수량 늘리기`} onClick={() => run('cart.inc', l.menuId)}>+</button>
              <button className="ct-del" aria-label={`${l.name} 삭제`} onClick={() => run('cart.remove', l.menuId)}>🗑</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="ct-sum">
        <div><span>상품금액</span><span>{n(c.itemsTotal)}</span></div>
        <div><span>배달비</span><span>{n(c.fee)}</span></div>
        <div className="ct-total"><span>합계</span><span>{n(c.total)}</span></div>
      </div>
      {c.shortBy > 0 && <p className="ct-short" role="alert">최소주문금액까지 {n(c.shortBy)} 남았어요</p>}
      <label className="ct-lbl" htmlFor="ct-addr">배달 주소</label>
      <input id="ct-addr" className="ct-input" aria-label="배달 주소 입력" value={state.data.address}
        onChange={e => run('address.set', e.target.value)} />
      <label className="ct-lbl" htmlFor="ct-req">요청사항</label>
      <textarea id="ct-req" className="ct-text" aria-label="요청사항 입력" rows={3} value={state.data.request}
        onChange={e => run('request.set', e.target.value)} />
      <button className="ct-order" aria-label="주문하기" onClick={() => run('order.place')}>주문하기 · {n(c.total)}</button>
    </div>
  );
}
