# AGENTS.md — React Component Generator

## Operational Commands

```bash
bun run dev       # API 서버 + Vite 프론트엔드 동시 실행 (개발)
bun run server    # API 서버만 단독 실행 (port 3002)
bun run build     # TypeScript 컴파일 + Vite 번들
bun run lint      # ESLint 검사
bun run preview   # 빌드 결과 미리보기
```

**Package manager: bun 고정 — npm/yarn/pnpm 절대 사용 금지.**

## Project Context

사용자가 프롬프트를 입력하면 AI가 React 컴포넌트 코드를 생성하고, 브라우저에서 즉시 미리볼 수 있는 워크벤치 앱.
AI Provider: Anthropic (Claude Haiku) / Google (Gemini 2.5 Flash) — 런타임에 선택 가능.

Tech Stack: React 19, TypeScript, Vite, Bun server, react-live, ESLint

## Golden Rules

**Immutable:**
- API 키를 코드에 하드코딩하지 마라. 항상 환경변수(`process.env`) 또는 클라이언트 런타임 입력으로 처리한다.
- `server/index.ts`는 Bun 런타임 전용이다. Node.js API(`fs`, `path`, `http`)를 사용하지 마라.
- 생성되는 React 컴포넌트 코드(AI 출력)는 `react-live`의 `noInline` 모드로 실행된다. 이 제약을 항상 인지하라.

**Do:**
- 새 API Provider 추가 시 `Provider` 타입(`src/types/index.ts`)과 `ENV_KEYS`, `PROVIDER_CONFIG` 모두 동시에 갱신한다.
- 에러 응답은 `{ error: string }` JSON 형식으로 통일한다.
- CORS 헤더는 `CORS_HEADERS` 상수를 재사용한다 — 분산 정의 금지.

**Don't:**
- `src/` 코드에서 직접 외부 AI API를 호출하지 마라. 반드시 `/api/generate` 프록시를 경유한다.
- `fetch('/api/config')` 또는 `fetch('/api/generate')` 외의 경로를 프론트엔드에서 임의로 신설하지 마라.

## Standards

**Commit format:** `type: 설명` (예: `feat: Google provider 추가`, `fix: CORS 헤더 누락 수정`)

**TypeScript:** strict 모드. `as any` 캐스팅 금지. 외부 API 응답은 반드시 타입 단언(`as { ... }`)으로 처리.

**Maintenance:** 규칙과 코드 사이에 괴리가 생기면 이 파일 업데이트를 제안하라.

## Context Map

- **[API 서버 수정 (server/)](./server/AGENTS.md)** — Bun 서버, AI Provider 호출, 라우트 추가 시.
- **[UI 컴포넌트 수정 (src/components/)](./src/components/AGENTS.md)** — react-live 프리뷰, 컴포넌트 카드, 스타일링 작업 시.
