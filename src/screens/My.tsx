import '../ui/styles2.css';
import { useApp } from '../ui/store';
import { run as core } from '../core/commands';

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function My() {
  const { state, run } = useApp();
  const out = (id: string) => core(state, id).output ?? '';
  return (
    <div>
      <h2 className="s2-h">배달 주소</h2>
      <input className="s2-input" aria-label="배달 주소" value={state.data.address} onChange={e => run('address.set', e.target.value)} />
      <div className="s2-btns">
        <div className="s2-row">
          <button className="s2-btn" style={{ flex: 1 }} aria-label="되돌리기" disabled={!state.past.length} onClick={() => run('edit.undo')}>되돌리기</button>
          <button className="s2-btn" style={{ flex: 1 }} aria-label="다시 실행" disabled={!state.future.length} onClick={() => run('edit.redo')}>다시 실행</button>
        </div>
        <button className="s2-btn" aria-label="파일 저장 (JSON)" onClick={() => download('hankkikok.json', out('data.exportJson'), 'application/json')}>파일 저장(JSON)</button>
        <button className="s2-btn" aria-label="CSV 내보내기" onClick={() => download('hankkikok-orders.csv', out('data.exportCsv'), 'text/csv;charset=utf-8')}>CSV 내보내기</button>
        <label className="s2-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          파일 열기
          <input type="file" accept=".json" aria-label="파일 열기" style={{ display: 'none' }}
            onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) run('data.import', await f.text()); }} />
        </label>
        <button className="s2-btn danger" aria-label="초기화" onClick={() => run('data.reset')}>초기화</button>
      </div>
      <p className="s2-mu">한끼콕 v0.1.0</p>
    </div>
  );
}
