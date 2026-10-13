# 한끼콕 (HankkiKok) 규칙집

## 클린룸 규칙
- 원본 앱/동종 오픈소스의 코드를 보거나 복사하지 않는다. 근거는 공식 소개문·공개 형식 규격·직접 만든 샘플뿐.
- 원본 이름·로고·아이콘·폰트·템플릿 금지. 범용 라이브러리(React, Vite 등)는 허용.

## 구조
- `src/core/` 데이터·명령 (화면 무관, 순수 함수): types, seed, logic, commands(명령표+단축키), io(JSON/CSV)
- `src/screens/`, `src/ui/` React 화면. 상태 변경은 오직 `useApp().run(id,arg)`.
- `tests/` vitest. `samples/` 시험용 파일. `scripts/` 샘플 생성·포장. `docs/` 명세.

## 명령
- 개발 `npm run dev` / 검증 `npm test` / 빌드 `npm run build` / 포장 `npm run pack` → `release/한끼콕.html`

## 완료의 정의
1. `npm run build` 타입 오류 0 2. SPEC.md 모든 완료 기준(F1~F17)에 대응하는 자동 테스트 통과
3. samples 전체 열기→저장→다시열기 무변경 4. 한글 입력 자모 분리 없음 5. 미구현은 docs/GAPS.md에 기록
