import { useState, useCallback } from 'react';

export const STORAGE_KEYS = {
  API_KEY:        'rcg:apiKey',
  PROVIDER:       'rcg:provider',
  COMPONENTS:     'rcg:components',
  PROMPT_HISTORY: 'rcg:promptHistory',
} as const;

export interface Serializer<T> {
  serialize: (value: T) => string;
  deserialize: (raw: string) => T;
}

export function readFromStorage<T>(
  key: string,
  initialValue: T,
  serializer?: Serializer<T>,
): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return initialValue;
    return serializer ? serializer.deserialize(raw) : (JSON.parse(raw) as T);
  } catch {
    console.warn(`[useLocalStorage] Failed to read key "${key}"`);
    return initialValue;
  }
}

export function writeToStorage<T>(
  key: string,
  value: T,
  serializer?: Serializer<T>,
): void {
  try {
    const serialized = serializer ? serializer.serialize(value) : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch {
    console.error(`[useLocalStorage] Failed to write key "${key}"`);
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  serializer?: Serializer<T>,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readFromStorage(key, initialValue, serializer),
  );

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const newValue = typeof value === 'function'
        ? (value as (prev: T) => T)(prev)
        : value;
      writeToStorage(key, newValue, serializer);
      return newValue;
    });
  }, [key, serializer]);

  return [storedValue, setValue];
}
