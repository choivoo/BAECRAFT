import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from '../src/App';
import { AppProvider } from '../src/ui/store';

const mount = () => render(<AppProvider><App /></AppProvider>);
const tabBtn = (label: string) => screen.getByRole('navigation').querySelectorAll('button')[
  ['홈', '검색', '주문내역', '찜', '마이'].indexOf(label)] as HTMLButtonElement;

beforeEach(() => { localStorage.clear(); });
afterEach(() => cleanup());

describe('ui', () => {
  it('하단 탭 이동', () => {
    mount();
    const tabs = screen.getByRole('navigation').querySelectorAll('button');
    expect(tabs).toHaveLength(5);
    fireEvent.click(tabBtn('검색'));
    expect(tabBtn('검색').className).toContain('on');
    fireEvent.click(tabBtn('주문내역'));
    expect(tabBtn('주문내역').className).toContain('on');
    expect(tabBtn('검색').className).not.toContain('on');
    fireEvent.click(tabBtn('마이'));
    expect(tabBtn('마이').className).toContain('on');
  });

  it('검색 입력 한글 유지', () => {
    mount();
    fireEvent.click(tabBtn('검색'));
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input).toBeTruthy();
    fireEvent.change(input, { target: { value: '제육' } });
    expect(input.value).toBe('제육');
    expect((document.querySelector('input') as HTMLInputElement).value).toBe('제육');
  });

  it('Ctrl+Z 단축키로 되돌리기', () => {
    mount();
    // 주소 버튼 -> 마이 탭에서 주소 변경이 화면마다 다를 수 있어, 찜/장바구니 대신 헤더 장바구니 배지로 확인할 수 없으므로
    // 저장소(localStorage)에 반영된 데이터로 검증한다. 편집은 주소 입력으로 수행.
    fireEvent.click(tabBtn('마이'));
    const inputs = Array.from(document.querySelectorAll('input,textarea')) as HTMLInputElement[];
    expect(inputs.length).toBeGreaterThan(0);
    const before = document.querySelector('.addr')!.textContent;
    fireEvent.change(inputs[0], { target: { value: '테스트 주소 한글' } });
    fireEvent.blur(inputs[0]);
    const changed = document.querySelector('.addr')!.textContent;
    expect(changed).toContain('테스트 주소 한글');
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
    expect(document.querySelector('.addr')!.textContent).toBe(before);
  });
});
