// Live data from the public GitHub REST API. No token: the unauthenticated
// limit is 60 requests/hour per visitor IP, so responses are cached in
// sessionStorage and the whole page still renders if GitHub is unreachable.

import { useEffect, useState } from 'react';
import { profile } from '../data/profile';

const API = 'https://api.github.com';
const TTL_MS = 30 * 60 * 1000;
const MAX_LANGUAGE_REPOS = 8;

export type GhUser = {
  login: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  created_at: string;
};

export type GhRepo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  homepage: string | null;
};

export type GhEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    action?: string;
    ref?: string | null;
    ref_type?: string;
    size?: number;
    commits?: unknown[];
    number?: number;
    pull_request?: { number: number };
  };
};

export type GitHubData = {
  user: GhUser;
  repos: GhRepo[];
  events: GhEvent[];
  languages: { name: string; bytes: number }[];
};

export type GitHubState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: GitHubData };

async function cachedJson<T>(path: string): Promise<T> {
  const key = `gh:${path}`;
  try {
    const hit = sessionStorage.getItem(key);
    if (hit) {
      const { t, data } = JSON.parse(hit) as { t: number; data: T };
      if (Date.now() - t < TTL_MS) return data;
    }
  } catch {
    // storage unavailable (private mode etc.) — fall through to network
  }
  const res = await fetch(API + path, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  const data = (await res.json()) as T;
  try {
    sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data }));
  } catch {
    // quota or privacy mode — caching is best-effort
  }
  return data;
}

async function loadGitHub(username: string, hidden: string[]): Promise<GitHubData> {
  const [user, allRepos, events] = await Promise.all([
    cachedJson<GhUser>(`/users/${username}`),
    cachedJson<GhRepo[]>(`/users/${username}/repos?per_page=100&sort=pushed`),
    cachedJson<GhEvent[]>(`/users/${username}/events/public?per_page=30`).catch(() => []),
  ]);

  const hide = new Set(hidden.map((h) => h.toLowerCase()));
  const repos = allRepos.filter((r) => !r.fork && !r.archived && !hide.has(r.name.toLowerCase()));

  // Aggregate language bytes across the most recently active repos.
  const perRepo = await Promise.all(
    repos
      .slice(0, MAX_LANGUAGE_REPOS)
      .map((r) =>
        cachedJson<Record<string, number>>(`/repos/${username}/${r.name}/languages`).catch(
          () => ({}) as Record<string, number>,
        ),
      ),
  );
  const totals = new Map<string, number>();
  for (const langs of perRepo) {
    for (const [name, bytes] of Object.entries(langs)) {
      totals.set(name, (totals.get(name) ?? 0) + bytes);
    }
  }
  const languages = [...totals.entries()]
    .map(([name, bytes]) => ({ name, bytes }))
    .sort((a, b) => b.bytes - a.bytes);

  return { user, repos, events, languages };
}

// One shared request for every component on the page.
let pending: Promise<GitHubData> | null = null;

export function useGitHub(username: string, hidden: string[] = profile.hiddenRepos): GitHubState {
  const [state, setState] = useState<GitHubState>({ status: 'loading' });
  useEffect(() => {
    let alive = true;
    pending ??= loadGitHub(username, hidden);
    pending.then(
      (data) => alive && setState({ status: 'ready', data }),
      () => {
        pending = null;
        if (alive) setState({ status: 'error' });
      },
    );
    return () => {
      alive = false;
    };
  }, [username]);
  return state;
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

export function isWithinDays(iso: string, days: number): boolean {
  return Date.now() - new Date(iso).getTime() < days * 86_400_000;
}

export function timeAgo(iso: string): string {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

export function describeEvent(e: GhEvent, owner: string): string | null {
  const repo = e.repo.name.startsWith(`${owner}/`) ? e.repo.name.slice(owner.length + 1) : e.repo.name;
  const p = e.payload;
  switch (e.type) {
    case 'PushEvent': {
      const n = p.size ?? p.commits?.length;
      return n ? `Pushed ${n} commit${n === 1 ? '' : 's'} to ${repo}` : `Pushed to ${repo}`;
    }
    case 'CreateEvent':
      return p.ref_type === 'repository' ? `Created ${repo}` : `Created ${p.ref_type} ${p.ref ?? ''} in ${repo}`;
    case 'PullRequestEvent':
      return `${capitalize(p.action ?? 'updated')} pull request #${p.number ?? p.pull_request?.number} in ${repo}`;
    case 'IssuesEvent':
      return `${capitalize(p.action ?? 'updated')} an issue in ${repo}`;
    case 'ReleaseEvent':
      return `Published a release of ${repo}`;
    case 'PublicEvent':
      return `Open-sourced ${repo}`;
    case 'ForkEvent':
      return `Forked ${repo}`;
    case 'WatchEvent':
      return `Starred ${repo}`;
    default:
      return null;
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
