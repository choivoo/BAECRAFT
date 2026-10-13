import { useState } from 'react';
import '../ui/styles2.css';
import { useApp } from '../ui/store';

export default function Review({ orderId }: { orderId: string }) {
  const { state, run } = useApp();
  const o = state.data.orders.find(x => x.id === orderId);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  return (
    <div>
      <h2 className="s2-h">{o ? o.storeName : '리뷰'} 리뷰 쓰기</h2>
      <div className="s2-stars" role="group" aria-label="별점">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} aria-label={`별점 ${n}점`} aria-pressed={rating === n} onClick={() => setRating(n)}>{n <= rating ? '★' : '☆'}</button>
        ))}
      </div>
      <textarea className="s2-input" aria-label="리뷰 내용" placeholder="음식은 어떠셨나요?" value={text} onChange={e => setText(e.target.value)} />
      <div className="s2-btns">
        <button className="s2-btn pri" aria-label="리뷰 등록" onClick={() => run('review.submit', `${orderId}|${rating}|${text}`)}>등록</button>
      </div>
    </div>
  );
}
