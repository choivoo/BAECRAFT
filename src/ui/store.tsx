import { createContext, useContext, useEffect, useMemo, useReducer, useCallback, type ReactNode } from 'react';
import type { AppState } from '../core/types';
import { initialState } from '../core/logic';
import { run as runCmd, matchShortcut, type Arg } from '../core/commands';
import { exportJson, importJson } from '../core/io';

const KEY = 'hankkikok.v1';
function load(): AppState {
  try { const t = localStorage.getItem(KEY); if (t) return initialState(importJson(t)); } catch { /* 저장소 없음 */ }
  return initialState();
}
interface Api { state: AppState; run: (id: string, arg?: Arg) => string | undefined }
const Ctx = createContext<Api>(null as never);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer((s: AppState, a: { id: string; arg?: Arg }) => runCmd(s, a.id, a.arg).state, undefined, load);
  const run = useCallback((id: string, arg?: Arg) => { dispatch({ id, arg }); return undefined; }, []);
  useEffect(() => { try { localStorage.setItem(KEY, exportJson(state.data)); } catch { /* 무시 */ } }, [state.data]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
      const m = matchShortcut(e);
      if (!m || (typing && !e.ctrlKey && !e.metaKey)) return;
      if (typing && m.cmd.startsWith('edit.')) return; // 입력칸 안의 기본 되돌리기는 브라우저에 맡김
      e.preventDefault(); dispatch({ id: m.cmd, arg: m.arg });
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, []);
  useEffect(() => { if (!state.view.toast) return; const t = setTimeout(() => dispatch({ id: 'nav.stay' }), 2200); return () => clearTimeout(t); }, [state.view.toast]);
  const api = useMemo(() => ({ state, run }), [state, run]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
