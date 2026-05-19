import { describe, test, expect, beforeEach } from 'bun:test';
import { readFromStorage, writeToStorage } from '../hooks/useLocalStorage';

const createMockStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    get length() { return store.size; },
    key: (n: number) => Array.from(store.keys())[n] ?? null,
  };
};

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createMockStorage(),
    writable: true,
    configurable: true,
  });
});

describe('readFromStorage', () => {
  test('storage가 비어있을 때 initialValue를 반환한다', () => {
    expect(readFromStorage('key', 'default')).toBe('default');
  });

  test('기존 값이 있을 때 파싱해서 반환한다', () => {
    localStorage.setItem('key', JSON.stringify('saved'));
    expect(readFromStorage('key', 'default')).toBe('saved');
  });

  test('배열 타입도 올바르게 복원한다', () => {
    const arr = [1, 2, 3];
    localStorage.setItem('nums', JSON.stringify(arr));
    expect(readFromStorage('nums', [])).toEqual([1, 2, 3]);
  });

  test('corrupt JSON 저장 시 initialValue를 반환하고 throw하지 않는다', () => {
    localStorage.setItem('bad', 'not-json-at-all{{{');
    expect(() => readFromStorage('bad', 'fallback')).not.toThrow();
    expect(readFromStorage('bad', 'fallback')).toBe('fallback');
  });

  test('custom serializer가 있으면 deserialize를 호출한다', () => {
    localStorage.setItem('date', '"2025-01-01T00:00:00.000Z"');
    const serializer = {
      serialize: (v: Date) => JSON.stringify(v.toISOString()),
      deserialize: (s: string) => new Date(JSON.parse(s) as string),
    };
    const result = readFromStorage('date', new Date(0), serializer);
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2025);
  });
});

describe('writeToStorage', () => {
  test('값을 JSON으로 직렬화해서 저장한다', () => {
    writeToStorage('key', { a: 1 });
    expect(localStorage.getItem('key')).toBe(JSON.stringify({ a: 1 }));
  });

  test('custom serializer가 있으면 serialize를 호출한다', () => {
    const serializer = {
      serialize: (v: number) => `custom:${v}`,
      deserialize: (s: string) => Number(s.replace('custom:', '')),
    };
    writeToStorage('num', 42, serializer);
    expect(localStorage.getItem('num')).toBe('custom:42');
  });

  test('setItem이 throw해도 에러를 외부로 전파하지 않는다', () => {
    const brokenStorage = {
      ...createMockStorage(),
      setItem: () => { throw new DOMException('QuotaExceededError'); },
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: brokenStorage,
      writable: true,
      configurable: true,
    });
    expect(() => writeToStorage('key', 'value')).not.toThrow();
  });
});
