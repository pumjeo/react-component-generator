# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React 컴포넌트 생성기 — 프롬프트를 입력하면 AI가 React 컴포넌트를 실시간으로 생성하고 미리보는 도구입니다.

## Development Commands

### Setup & Dependencies
```bash
# 의존성 설치
bun install

# .env 파일 설정 (선택사항)
cp .env.example .env
# .env에 ANTHROPIC_API_KEY 또는 GOOGLE_API_KEY 입력
```

### Running
```bash
# 개발 서버 실행 (API 서버 + Vite 동시 실행)
bun run dev

# API 서버만 실행 (포트 3002)
bun run server

# Vite 개발 서버만 실행 (포트 5173)
```

### Building & Quality
```bash
# 프로덕션 빌드
bun run build

# 린팅 (ESLint)
bun run lint

# 빌드된 파일 미리보기
bun run preview
```

## Architecture

### Client-Server Structure

**클라이언트 (Vite + React 19):**
- 포트: `http://localhost:5173`
- UI 렌더링, 사용자 입력 처리
- API 요청은 `/api/*`로 프록시되어 서버로 전달

**서버 (Bun):**
- 포트: `3002`
- 역할: AI API 프록시 + 요청 처리
- CORS 헤더 처리
- Claude/Gemini API 호출

### Frontend Architecture

```
src/
├── App.tsx                    # 메인 애플리케이션 (레이아웃, 상태 관리)
├── components/
│   ├── PromptInput.tsx       # 프롬프트 입력 폼 + 예시
│   ├── ComponentCard.tsx     # 생성된 컴포넌트 카드 (미리보기/코드 탭)
│   ├── LivePreview.tsx       # react-live를 사용한 실시간 렌더링
│   └── CodeView.tsx          # 코드 표시 (구문 강조)
├── hooks/
│   └── useComponentGenerator.ts  # AI 요청 로직 (상태 관리, 에러 처리)
├── types/
│   └── index.ts              # Provider, GeneratedComponent 타입
└── App.css / index.css       # 전역 스타일
```

**상태 흐름:**
1. 사용자가 프롬프트 입력
2. `useComponentGenerator` 훅이 `/api/generate` POST 요청
3. 서버가 Claude/Gemini API 호출
4. 응답받은 코드를 `GeneratedComponent` 객체로 저장
5. `ComponentCard`에서 `LivePreview`로 실시간 렌더링

### Backend (Server)

**주요 엔드포인트:**

```
GET /api/config
  → { envKeys: { anthropic: boolean, google: boolean } }
  → .env에 API 키 설정 여부 확인

POST /api/generate
  Body: { prompt: string, apiKey?: string, provider?: 'anthropic' | 'google' }
  → { code: string }
  → AI 생성 코드 반환
```

**AI 모델:**
- Anthropic: `claude-haiku-4-5-20251001` (max_tokens: 4096)
- Google: `gemini-2.5-flash` (maxOutputTokens: 8192)

**코드 정제:**
- 백틱(````) 제거
- `render(<ComponentName />)` 호출 자동 추가 (없으면)

## Key Technical Decisions

### 1. Dual-Provider Architecture
Claude와 Gemini 중 선택 가능하도록 설계. 비용/성능 트레이드오프를 사용자에게 제공.

### 2. Inline Styles Only
생성된 컴포넌트는 CSS import 없이 인라인 스타일만 사용. react-live 환경에서 완전히 독립적이어야 함.

### 3. No TypeScript in Generated Code
생성 프롬프트에서 명시적으로 "TypeScript 문법 금지" — jsx 런타임 환경에서 타입 검사 불필요.

### 4. Automatic render() Call
사용자가 `render()`를 잊어도 자동 추가되도록. API 레이어에서 처리.

## Development Focus Areas

### When Adding Features
- **UI 변경**: `src/App.tsx` 및 `src/components/` 수정 후 `src/App.css`에서 스타일
- **API 변경**: `server/index.ts` 수정 (프롬프트, 엔드포인트, 에러 처리)
- **상태 관리**: `useComponentGenerator` 훅에 로직 추가
- **스타일 개선**: `src/App.css` (최근에 프리미엄 디자인으로 개선됨)

### Important Implementation Details

**프롬프트 엔지니어링:**
- `SYSTEM_PROMPT` (server/index.ts)는 생성 코드의 품질을 좌우함
- React hooks 사용 가능 (`React.useState`, `React.useEffect`)
- 각 모델마다 최적 토큰 수 다름 (Anthropic 4096, Gemini 8192)

**에러 처리:**
- 503, 429 에러는 특별한 사용자 메시지 제공
- 빈 응답 체크 (특히 Gemini의 MAX_TOKENS 도달 시)

## Project-Scoped Skills

이 프로젝트에는 프로젝트 스코프 스킬이 있습니다:

### `commit` 스킬
- **위치**: `.claude/projects/.../skills/commit/`
- **사용**: "커밋해줘", "변경사항 저장" 등
- **기능**: 
  - `git diff` 분석
  - 논리적 단위로 분류
  - Conventional Commits 형식의 한국어 메시지 생성
  - 사용자 승인 후 자동 커밋

## Design System

최근 프리미엄 디자인 개선 (프롬프트: "프론트엔드 디자인을 개선해보고 싶어"):

**색상:**
- 프리미엄 그래디언트: `#667eea` → `#764ba2` (인디고/보라)
- 악센트: `#f5576c` (핑크)
- 배경: `#f5f3ff` (라벤더)

**타이포그래피:**
- Display: "Plus Jakarta Sans" (프리미엄 산세리프)
- Code: "JetBrains Mono"

**애니메이션:**
- 카드 생성: 스테거 효과 (`animation-delay`)
- Hover: 부드러운 상승 + 글로우 그림자
- 로딩: 펄스 애니메이션

## Common Workflows

### 새로운 UI 컴포넌트 추가
1. `src/components/` 에 `.tsx` 파일 생성
2. `App.tsx`에서 import 및 JSX 추가
3. `src/App.css`에 스타일 추가 (BEM 네이밍 권장)

### 미리보기 기능 확장
- `LivePreview.tsx`는 `react-live`의 `LiveProvider`를 감싸는 래퍼
- 렌더링 에러 시 `preview-error` 클래스로 표시

### API 모델 변경
1. `server/index.ts`의 `SYSTEM_PROMPT` 검토
2. `callAnthropic()` 또는 `callGoogle()` 함수 수정
3. 토큰 한계 및 응답 형식 확인

## Notes for Future Development

- **Performance**: react-live 렌더링은 복잡한 컴포넌트에서 느릴 수 있음. 대용량 렌더링 시 debounce 고려.
- **API Cost**: 각 생성 요청마다 API 호출 발생. 사용자에게 투명하게 공지.
- **Security**: `.env` 파일은 git에 커밋되지 않음 (.gitignore 참고).
- **Styling**: CSS 변수는 `src/App.css` :root에 정의됨. 전역 변경 시 여기서 수정.
