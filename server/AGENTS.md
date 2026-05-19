# AGENTS.md — server/

Bun HTTP 서버. `/api/config`와 `/api/generate` 두 엔드포인트만 처리한다.
AI Provider(Anthropic, Google)를 추상화하고 프론트엔드에 단일 인터페이스를 제공한다.

## Tech Stack & Constraints

- **Runtime:** Bun 전용. `Bun.serve()` 사용 — `http.createServer()` 금지.
- **Fetch:** 전역 `fetch` 사용 — `axios`, `node-fetch` 등 추가 의존성 금지.
- **Port:** 3002 고정. 변경 시 `vite.config.ts`의 프록시 설정도 함께 수정.

## Implementation Patterns

**Provider 추가 절차:**
1. `Provider` 타입(`src/types/index.ts`)에 새 값 추가.
2. `ENV_KEYS`에 환경변수 키 추가.
3. `callXxx(prompt, apiKey)` 함수 작성 — 반환 타입 `Promise<string>`.
4. `fetch` 분기 블록(`provider === 'xxx'`)에 추가.
5. `PROVIDER_CONFIG`(`src/App.tsx`)에 label/placeholder 추가.

**에러 처리 패턴:**
```ts
return Response.json({ error: message }, { status: 4xx, headers: CORS_HEADERS });
```
- 503 (과부하), 429 (rate limit) 는 사용자 친화적 한국어 메시지로 변환.
- 그 외 에러는 `err.message` 그대로 전달.

**응답 후처리 파이프라인:**
```
AI 원문 → stripCodeFences() → ensureRenderCall() → { code } JSON 응답
```
- 이 파이프라인을 우회하거나 순서를 바꾸지 마라.

## Local Golden Rules

**Do:**
- `resolveApiKey()` 함수를 통해 키 우선순위(클라이언트 입력 > 환경변수)를 유지한다.
- `CORS_HEADERS`를 모든 응답에 포함한다. OPTIONS preflight 처리를 잊지 마라.
- `ensureRenderCall()`은 `render(<ComponentName />)` 호출이 없을 때만 보정한다 — 기존 render 호출을 중복 추가하지 않는다.

**Don't:**
- `SYSTEM_PROMPT`를 수정할 때 "TypeScript 문법 금지" 규칙을 제거하지 마라 — react-live는 TSX를 지원하지 않는다.
- Provider별 함수에서 `stripCodeFences`/`ensureRenderCall`을 직접 호출하지 마라 — 메인 핸들러에서만 호출.
