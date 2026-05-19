# AGENTS.md — src/components/

UI 컴포넌트 레이어. AI가 생성한 코드를 `react-live`로 실행하고 시각화하는 책임을 가진다.

## react-live 제약 (절대 규칙)

`LiveProvider`는 `noInline={true}` 모드로 동작한다. 이 모드의 핵심 제약:

- 실행 코드 마지막에 반드시 `render(<ComponentName />)` 호출이 있어야 한다.
- `import` 문은 허용되지 않는다 — React는 전역 스코프에 이미 주입되어 있다.
- TypeScript 문법(타입 어노테이션, `as`, 제네릭)은 파싱 오류를 유발한다.
- CSS 모듈, 외부 CSS 파일 임포트 불가 — 인라인 스타일만 사용 가능.

이 제약은 `server/index.ts`의 `SYSTEM_PROMPT`와 직접 연결된다. 제약을 바꾸려면 양쪽을 동시에 수정해야 한다.

## Component Patterns

**LivePreview:** `<LiveProvider code={code} noInline>` 구조를 변경하지 마라. `noInline` prop 제거 시 `render()` 패턴이 깨진다.

**ComponentCard:** 생성된 컴포넌트 1개를 카드로 래핑. `onRemove`, `onRegenerate` 콜백을 prop으로 받는다.

**PromptInput:** 생성 요청 폼. `isLoading` 상태일 때 입력을 막는다.

**CodeView:** AI가 반환한 원본 코드를 표시. 코드 하이라이팅 라이브러리를 추가할 경우 번들 크기를 확인한다.

## Local Golden Rules

**Do:**
- 새 컴포넌트 추가 시 `src/types/index.ts`의 기존 타입을 먼저 확인하고 재사용한다.
- 스타일은 `App.css`의 BEM 유사 클래스명 체계를 따른다 (`panel-header`, `btn-clear` 등).
- `LiveError`는 `LiveProvider` 내부에 항상 포함해 런타임 오류를 사용자에게 표시한다.

**Don't:**
- `LiveProvider` 외부에서 AI 생성 코드를 `eval()`하거나 `dangerouslySetInnerHTML`로 주입하지 마라.
- `useComponentGenerator` hook 로직을 컴포넌트 내부로 인라인하지 마라 — hook으로 분리된 상태를 유지한다.
