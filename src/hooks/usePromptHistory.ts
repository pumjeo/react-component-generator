import { useLocalStorage, STORAGE_KEYS } from './useLocalStorage';

export function buildUpdatedHistory(
  current: string[],
  newPrompt: string,
  maxSize = 10,
): string[] {
  const trimmed = newPrompt.trim();
  if (!trimmed) return current;
  const deduplicated = current.filter((p) => p !== trimmed);
  return [trimmed, ...deduplicated].slice(0, maxSize);
}

export function usePromptHistory() {
  const [history, setHistory] = useLocalStorage<string[]>(STORAGE_KEYS.PROMPT_HISTORY, []);

  const addToHistory = (prompt: string) => {
    setHistory((prev) => buildUpdatedHistory(prev, prompt));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return { history, addToHistory, clearHistory };
}
