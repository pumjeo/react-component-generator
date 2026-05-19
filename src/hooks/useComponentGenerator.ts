import { useState, useCallback } from 'react';
import type { GeneratedComponent, StoredComponent, Provider } from '../types';
import { useLocalStorage, STORAGE_KEYS } from './useLocalStorage';
import type { Serializer } from './useLocalStorage';

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

const componentSerializer: Serializer<GeneratedComponent[]> = {
  serialize: (components) =>
    JSON.stringify(
      components.map((c): StoredComponent => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
    ),
  deserialize: (raw) => {
    const stored = JSON.parse(raw) as StoredComponent[];
    return stored.map((c): GeneratedComponent => {
      const date = new Date(c.createdAt);
      return { ...c, createdAt: isNaN(date.getTime()) ? new Date() : date };
    });
  },
};

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useLocalStorage<GeneratedComponent[]>(
    STORAGE_KEYS.COMPONENTS,
    [],
    componentSerializer,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate component');
      }

      const newComponent: GeneratedComponent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        prompt,
        code: data.code,
        createdAt: new Date(),
      };

      setComponents((prev) => [newComponent, ...prev]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setComponents([]);
  }, []);

  return { components, isLoading, error, generate, removeComponent, clearAll };
}
