import { useCallback, useEffect, useState } from 'react';

// The saved choice is applied before first paint by the inline script in
// index.html; with no saved choice the CSS follows prefers-color-scheme.

type Theme = 'light' | 'dark';
const KEY = 'theme';

function effectiveTheme(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(effectiveTheme);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setTheme(effectiveTheme());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = effectiveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // storage blocked — the choice just won't persist
    }
    setTheme(next);
  }, []);

  return { theme, toggle };
}
