import { useApp } from './ui/store';
import Home from './screens/Home'; import Search from './screens/Search'; import StoreDetail from './screens/StoreDetail';
import Cart from './screens/Cart'; import Orders from './screens/Orders'; import OrderDetail from './screens/OrderDetail';
import Favorites from './screens/Favorites'; import My from './screens/My'; import Review from './screens/Review';
import { cartSummary } from './core/logic';
import type { Tab } from './core/types';

const TABS: { id: Tab; cmd: string; icon: string; label: string }[] = [
  { id: 'home', cmd: 'nav.home', icon: '🏠', label: '홈' }, { id: 'search', cmd: 'nav.search', icon: '🔍', label: '검색' },
  { id: 'orders', cmd: 'nav.orders', icon: '🧾', label: '주문내역' }, { id: 'favorites', cmd: 'nav.favorites', icon: '💚', label: '찜' },
  { id: 'my', cmd: 'nav.my', icon: '👤', label: '마이' },
];
export default function App() {
  const { state, run } = useApp();
  const { view, data } = state;
  const top = view.stack[view.stack.length - 1];
  const count = cartSummary(data).count;
  let body;
  if (top) {
    body = top.kind === 'store' ? <StoreDetail storeId={top.storeId} /> : top.kind === 'cart' ? <Cart />
      : top.kind === 'order' ? <OrderDetail orderId={top.orderId} /> : <Review orderId={top.orderId} />;
  } else body = { home: <Home />, search: <Search />, orders: <Orders />, favorites: <Favorites />, my: <My /> }[view.tab];
  return (
    <div className="app">
      <header className="topbar">
        <button className="addr" aria-label="배달 주소" onClick={() => run('nav.my')}>📍 {data.address || '주소를 입력해 주세요'}</button>
        <button className="cartbtn" aria-label="장바구니" onClick={() => run('cart.open')}>🛒{count > 0 && <b className="badge">{count}</b>}</button>
      </header>
      {top && <button className="back" aria-label="뒤로" onClick={() => run('nav.back')}>← 뒤로</button>}
      <main className="content">{body}</main>
      {view.toast && <div className="toast" role="status">{view.toast}</div>}
      <nav className="tabbar">
        {TABS.map(t => <button key={t.id} className={!top && view.tab === t.id ? 'on' : ''} onClick={() => run(t.cmd)}><span>{t.icon}</span>{t.label}</button>)}
      </nav>
    </div>
  );
}
