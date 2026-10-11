import { highlights, profile } from '../data/profile';
import { describeEvent, isWithinDays, languageColor, timeAgo, useGitHub } from '../lib/github';
import { ArrowRight, FileText, GitHub, LinkedIn } from './Icons';

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="status" data-reveal>
            <span className="status-dot" aria-hidden />
            {profile.status} <span className="status-sep">·</span> {profile.location}
          </p>
          <h1 className="hero-name" data-reveal>
            {profile.shortName}
          </h1>
          <p className="hero-headline" data-reveal>
            {profile.headline}
          </p>
          <p className="hero-intro" data-reveal>
            {profile.intro}
          </p>
          <div className="hero-ctas" data-reveal>
            <a href="#work" className="btn btn-primary">
              See my work <ArrowRight width={16} height={16} />
            </a>
            <a href={profile.links.resume} className="btn btn-ghost" target="_blank" rel="noreferrer">
              <FileText width={16} height={16} /> Resume
            </a>
            <a href={profile.links.github} className="icon-btn icon-btn-lg" target="_blank" rel="noreferrer" aria-label="GitHub profile">
              <GitHub />
            </a>
            <a href={profile.links.linkedin} className="icon-btn icon-btn-lg" target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
              <LinkedIn />
            </a>
          </div>
        </div>

        <GitHubCard />
      </div>

      <div className="container">
        <dl className="highlights" data-reveal>
          {highlights.map((h) => (
            <div key={h.label} className="highlight">
              <dt>{h.value}</dt>
              <dd>{h.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function GitHubCard() {
  const gh = useGitHub(profile.githubUser);

  return (
    <aside className="gh-card" data-reveal aria-label="Live GitHub summary">
      <div className="gh-card-head">
        <span className="live-pill">
          <span className="live-dot" aria-hidden /> Live from GitHub
        </span>
        <a href={profile.links.github} target="_blank" rel="noreferrer" className="gh-card-handle">
          @{profile.githubUser}
        </a>
      </div>

      {gh.status === 'loading' && (
        <div className="gh-card-body" aria-busy="true">
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row short" />
          <div className="skeleton skeleton-bar" />
        </div>
      )}

      {gh.status === 'error' && (
        <div className="gh-card-body">
          <p className="muted small">GitHub is taking a break right now.</p>
          <a className="text-link" href={profile.links.github} target="_blank" rel="noreferrer">
            View my profile on GitHub →
          </a>
        </div>
      )}

      {gh.status === 'ready' && <GitHubCardBody data={gh.data} />}
    </aside>
  );
}

const RECENT_DAYS = 60;

// "3 days ago" → "3d", for the compact stat tile.
function shortAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m`;
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  if (s < 86400 * 60) return `${Math.round(s / 86400)}d`;
  if (s < 86400 * 365) return `${Math.round(s / (86400 * 30))}mo`;
  return `${Math.round(s / (86400 * 365))}y`;
}

function GitHubCardBody({ data }: { data: import('../lib/github').GitHubData }) {
  const { user, repos, events, languages } = data;
  // Recency is only worth showing while it's recent; otherwise the card
  // falls back to stats that don't age.
  const latest = events
    .map((e) => ({ e, text: describeEvent(e, user.login) }))
    .find((x) => x.text && isWithinDays(x.e.created_at, RECENT_DAYS));
  const lastPushed = repos.find((r) => isWithinDays(r.pushed_at, RECENT_DAYS));
  const total = languages.reduce((s, l) => s + l.bytes, 0) || 1;
  const top = languages.slice(0, 4);

  return (
    <div className="gh-card-body">
      <div className="gh-stats">
        <div>
          <strong>{user.public_repos}</strong>
          <span>repos</span>
        </div>
        {lastPushed ? (
          <div>
            <strong>{shortAgo(lastPushed.pushed_at)}</strong>
            <span>last push</span>
          </div>
        ) : (
          <div>
            <strong>{languages.length}</strong>
            <span>languages</span>
          </div>
        )}
        <div>
          <strong>{new Date(user.created_at).getFullYear()}</strong>
          <span>on GitHub since</span>
        </div>
      </div>

      {(latest || lastPushed) && (
        <p className="gh-latest">
          <span className="muted">Latest · </span>
          {latest ? (
            <>
              {latest.text} <span className="muted">{timeAgo(latest.e.created_at)}</span>
            </>
          ) : (
            lastPushed && (
              <>
                Updated {lastPushed.name} <span className="muted">{timeAgo(lastPushed.pushed_at)}</span>
              </>
            )
          )}
        </p>
      )}

      {top.length > 0 && (
        <>
          <div className="lang-bar" role="img" aria-label={top.map((l) => `${l.name} ${Math.round((l.bytes / total) * 100)}%`).join(', ')}>
            {top.map((l) => (
              <span key={l.name} style={{ flexGrow: l.bytes, background: languageColor(l.name) }} />
            ))}
          </div>
          <ul className="lang-legend">
            {top.map((l) => (
              <li key={l.name}>
                <span className="lang-swatch" style={{ background: languageColor(l.name) }} />
                {l.name} <span className="muted">{Math.round((l.bytes / total) * 100)}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
