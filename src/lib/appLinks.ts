// On phones, open LinkedIn and GitHub links in their apps instead of the
// mobile website (LinkedIn's site shows a sign-in wall to most visitors).
// Desktop links are left alone.

type AppTarget = {
  match: RegExp;
  androidPackage: string;
  /** iOS custom URL scheme, given the URL path. Omit if the app has none. */
  ios?: (path: string) => string;
};

const APPS: AppTarget[] = [
  {
    match: /^https:\/\/(www\.)?linkedin\.com\/in\//i,
    androidPackage: 'com.linkedin.android',
    ios: (path) => `linkedin://${path.replace(/^\/+|\/+$/g, '')}`,
  },
  {
    match: /^https:\/\/(www\.)?github\.com\//i,
    androidPackage: 'com.github.android',
  },
];

const ua = navigator.userAgent;
const isAndroid = /Android/i.test(ua);
const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// How long to wait for the app before falling back to the website on iOS.
const IOS_FALLBACK_MS = 1500;

/** Tries to open `url` in its native app. Returns false if it doesn't apply. */
export function openInApp(url: string): boolean {
  if (!isAndroid && !isIOS) return false;
  const app = APPS.find((a) => a.match.test(url));
  if (!app) return false;
  const u = new URL(url);

  if (isAndroid) {
    // Chrome opens the app if installed, otherwise loads the fallback URL itself.
    window.location.href =
      `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;` +
      `package=${app.androidPackage};S.browser_fallback_url=${encodeURIComponent(url)};end`;
    return true;
  }

  if (!app.ios) return false; // iOS GitHub has no URL scheme; universal links handle it in Safari.

  // iOS: try the app's scheme; if the page is still visible afterwards the
  // app isn't installed, so go to the website.
  let leftPage = false;
  const onLeave = () => {
    leftPage = true;
  };
  document.addEventListener('visibilitychange', onLeave, { once: true });
  window.addEventListener('pagehide', onLeave, { once: true });
  window.location.href = app.ios(u.pathname);
  window.setTimeout(() => {
    document.removeEventListener('visibilitychange', onLeave);
    window.removeEventListener('pagehide', onLeave);
    if (!leftPage && !document.hidden) window.location.href = url;
  }, IOS_FALLBACK_MS);
  return true;
}

/** Opens a profile link from code (e.g. a terminal command). */
export function openExternal(url: string) {
  if (!openInApp(url)) window.open(url, '_blank', 'noopener');
}

/** Routes taps on matching <a> links through openInApp, site-wide. */
export function installAppLinks() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (a && openInApp(a.href)) e.preventDefault();
  });
}
