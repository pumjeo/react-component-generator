import { describe, test, expect } from 'bun:test';
import { buildUpdatedHistory } from '../hooks/usePromptHistory';

describe('buildUpdatedHistory', () => {
  test('빈 배열에 프롬프트를 추가한다', () => {
    expect(buildUpdatedHistory([], '첫 프롬프트')).toEqual(['첫 프롬프트']);
  });

  test('기존 배열 앞에 새 프롬프트를 삽입한다', () => {
    expect(buildUpdatedHistory(['B'], 'A')).toEqual(['A', 'B']);
  });

  test('중복 항목을 제거하고 최신 위치로 이동한다', () => {
    expect(buildUpdatedHistory(['A', 'B', 'C'], 'B')).toEqual(['B', 'A', 'C']);
  });

  test('최대 10개 제한을 초과하면 잘라낸다', () => {
    const current = Array.from({ length: 10 }, (_, i) => `prompt-${i}`);
    const result = buildUpdatedHistory(current, '새 프롬프트');
    expect(result.length).toBe(10);
    expect(result[0]).toBe('새 프롬프트');
  });

  test('입력값에 trim을 적용한다', () => {
    expect(buildUpdatedHistory([], '  hello  ')).toEqual(['hello']);
  });

  test('공백만 입력 시 무시하고 기존 배열을 반환한다', () => {
    const current = ['A'];
    expect(buildUpdatedHistory(current, '   ')).toEqual(['A']);
  });

  test('빈 문자열 입력 시 무시한다', () => {
    const current = ['A'];
    expect(buildUpdatedHistory(current, '')).toEqual(['A']);
  });

  test('대소문자는 별개로 취급한다', () => {
    const result = buildUpdatedHistory(['hello'], 'Hello');
    expect(result).toEqual(['Hello', 'hello']);
  });

  test('중복 제거 + 10개 제한 동시 적용', () => {
    const current = ['X', ...Array.from({ length: 9 }, (_, i) => `p-${i}`)];
    const result = buildUpdatedHistory(current, 'X');
    expect(result.length).toBe(10);
    expect(result[0]).toBe('X');
  });

  test('maxSize 파라미터를 적용한다', () => {
    const current = ['A', 'B', 'C'];
    const result = buildUpdatedHistory(current, 'D', 3);
    expect(result.length).toBe(3);
    expect(result).toEqual(['D', 'A', 'B']);
  });
});
