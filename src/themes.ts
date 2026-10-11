// Site themes. Every theme renders the same content from data/profile.ts.
// Switching reloads the page so only one theme's code and CSS is ever loaded.

export const THEMES = [
  { id: 'ide', label: 'Editor' },
  { id: 'poster', label: 'Poster' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

export const DEFAULT_THEME: ThemeId = 'ide';
const KEY = 'theme';

function isTheme(v: unknown): v is ThemeId {
  return THEMES.some((t) => t.id === v);
}

/** URL (?theme=) wins, then the visitor's last choice, then the default. */
export function currentTheme(): ThemeId {
  const fromUrl = new URLSearchParams(window.location.search).get(KEY);
  if (isTheme(fromUrl)) {
    remember(fromUrl);
    return fromUrl;
  }
  try {
    const saved = localStorage.getItem(KEY);
    if (isTheme(saved)) return saved;
  } catch {
    // storage blocked: fall through to the default
  }
  return DEFAULT_THEME;
}

export function switchTheme(id: ThemeId) {
  remember(id);
  window.location.href = `${window.location.pathname}?${KEY}=${id}`;
}

export function themeLabel(id: ThemeId): string {
  return THEMES.find((t) => t.id === id)!.label;
}

function remember(id: ThemeId) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // storage blocked: the URL parameter still works
  }
}
