# TDD Rule — React Component Generator

⚠️ **이 규칙은 Rigid — 상황에 맞게 변형하지 마라.**

## 1. 적용 기준 구분

### ✅ 반드시 TDD를 적용할 대상

- **비즈니스 로직**: Provider 선택, API 응답 파싱, 컴포넌트 생성 흐름
- **API 엔드포인트**: `/api/generate`, `/api/config` 등의 라우트 로직
- **유틸 함수**: 문자열 조작, 타입 변환, 에러 처리 헬퍼
- **상태 관리 로직**: 모델 전환, API 키 저장/로드
- **버그 수정**: 재현 가능한 버그는 테스트 → 수정 → 테스트 통과로 검증

### ❌ TDD가 불필요한 대상

- **타입 정의**: `src/types/index.ts`의 인터페이스/타입 별칭
- **설정 파일**: `.env`, `vite.config.ts`, `tsconfig.json`
- **순수 UI 렌더링**: 스타일만 다른 컴포넌트, 레이아웃 전용 마크업
- **SQL/데이터베이스 쿼리**: 데이터베이스가 없으므로 해당 없음
- **써드파티 라이브러리**: `react-live`, `vite` 자체의 동작은 테스트하지 않음

---

## 2. RED-GREEN-REFACTOR 사이클

### 🔴 RED 단계

**하나의 기능 = 하나의 테스트**

1. 테스트 파일 생성: `src/__tests__/기능명.test.ts` (또는 `.tsx`)
2. **반드시 실행해서 실패 확인** — 에러 메시지를 읽고 "기능이 구현되지 않았다"는 사실을 명백히 확인
3. 실패 이유가 명확해야 함:
   - ❌ `TypeError: xyz is not a function` → 함수 미구현
   - ❌ `expected 2 to equal 3` → 로직 오류
   - ✅ (이 정도면 OK)
4. **프로덕션 코드를 아직 작성하지 마라** — 오직 테스트만 작성

### 🟢 GREEN 단계

1. **최소한의 코드만 작성** — YAGNI 원칙 (You Aren't Gonna Need It)
   - 정확한 요구사항만 구현
   - 미래 확장성, 일반화는 REFACTOR에서
2. **신규 테스트 + 기존 테스트 모두 통과 확인** — `bun test` 또는 해당 테스트 스크립트 실행
3. 한 번에 하나의 테스트만 통과시킨다 (연쇄 수정 금지)

### 🔵 REFACTOR 단계

1. 모든 테스트가 green인 상태에서만 시작
2. 허용되는 작업:
   - **중복 제거**: 반복되는 코드 추출
   - **이름 개선**: 변수/함수명을 더 명확하게
   - **헬퍼 추출**: 복잡한 로직을 작은 함수로 분리
3. **금지되는 작업**:
   - 새로운 동작 추가 (RED로 돌아가야 함)
   - 기존 테스트 수정 (테스트가 명세이므로)
   - 라이브러리 추가 (필요하면 GREEN 단계에서)
4. REFACTOR 후 다시 테스트 실행 — 여전히 green인지 확인

### 🔁 반복

1. REFACTOR이 완료되면 **다음 기능에 대한 RED로 돌아가기**
2. 테스트 목록(할 일 목록)을 유지하며 하나씩 소비

---

## 3. 삭제 강제 규칙

| 상황 | 액션 |
|------|------|
| 테스트 전에 프로덕션 코드를 먼저 작성함 | **즉시 삭제 후 RED부터 재시작** |
| "일단 참고용으로 두고 나중에 테스트 추가" | **금지 — 지금 테스트를 먼저 쓰거나 코드를 삭제** |
| 테스트는 있지만 구현 코드가 중복됨 | **중복 제거 (REFACTOR)** |
| 테스트 없는 버그 수정 코드가 발견됨 | **수정 코드 보존, 테스트 추가 후 재검증** |

---

## 4. 변명 차단표

| 변명 | 반론 |
|------|------|
| "너무 단순해서 테스트 불필요" | 단순할수록 테스트는 30초면 완성. 비용 0에 가까움. 테스트가 버그를 잡음. |
| "나중에 테스트 추가하겠다" | "나중"은 오지 않음. 코드가 복잡해질수록 기존 테스트 추가는 더 어려워짐. 지금 하라. |
| "시간이 없다" | TDD가 더 빠름. RED/GREEN은 5분. 나중에 버그 디버깅은 30분. |
| "테스트를 삭제하면 이전 작업이 낭비됨" | 테스트 없이 코드를 남기는 게 더 큰 낭비. 믿을 수 없는 코드는 무조건 삭제. |
| "프로토타입이니까 TDD는 아직" | 프로토타입도 TDD로. 프로토타입→프로덕션이 되는 순간 테스트가 절대 필요. 처음부터 하라. |

---

## 5. 테스트 구조 예시 (선택사항)

```typescript
// ✅ RED: 테스트 먼저 작성
describe('generateComponent', () => {
  it('Claude provider with valid prompt returns valid React code', async () => {
    const result = await generateComponent('button', 'claude');
    expect(result).toMatch(/^export\s+/);
  });
});

// ✅ GREEN: 최소 구현
export async function generateComponent(prompt: string, provider: string) {
  return `export function Button() { return <button>{}</button>; }`;
}

// ✅ REFACTOR: 중복 제거, 이름 개선 (모든 테스트 여전히 pass)
export async function generateComponent(prompt: string, provider: string) {
  const apiCall = getProviderAPI(provider);
  return await apiCall(prompt);
}
```

---

**Why:** TDD는 설계 도구이자 안전망. 작은 스텝으로 확실하게 진행하는 것이 가장 빠르고 안전한 방법.

**How to apply:** 버그 수정, API 추가, 로직 변경이 필요하면 항상 RED부터 시작. 테스트 없는 코드 작성은 즉시 롤백.
