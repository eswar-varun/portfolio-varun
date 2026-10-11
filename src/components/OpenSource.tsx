import { profile } from '../data/profile';
import { describeEvent, isWithinDays, languageColor, timeAgo, useGitHub } from '../lib/github';
import { ArrowUpRight, Commit, Star } from './Icons';
import { SectionHead } from './SectionHead';

const MAX_REPOS = 6;
const MAX_EVENTS = 6;

export function OpenSource() {
  const gh = useGitHub(profile.githubUser);

  return (
    <section className="section" id="github">
      <div className="container">
        <SectionHead index="03" label="GitHub" title="Open source" />

        {gh.status === 'loading' && (
          <div className="repo-grid" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="repo-card skeleton-card">
                <div className="skeleton skeleton-row" />
                <div className="skeleton skeleton-row short" />
              </div>
            ))}
          </div>
        )}

        {gh.status === 'error' && (
          <p className="muted">
            Couldn't reach GitHub just now.{' '}
            <a className="text-link" href={profile.links.github} target="_blank" rel="noreferrer">
              See my repositories directly →
            </a>
          </p>
        )}

        {gh.status === 'ready' && <Ready data={gh.data} />}
      </div>
    </section>
  );
}

function Ready({ data }: { data: import('../lib/github').GitHubData }) {
  const repos = data.repos.slice(0, MAX_REPOS);
  const feed = data.events
    .map((e) => ({ e, text: describeEvent(e, data.user.login) }))
    .filter((x): x is { e: typeof x.e; text: string } => !!x.text)
    .slice(0, MAX_EVENTS);

  return (
    <div className={`gh-layout${feed.length ? '' : ' no-feed'}`}>
      <div className="repo-grid">
        {repos.map((r) => (
          <a key={r.name} href={r.html_url} target="_blank" rel="noreferrer" className="repo-card" data-reveal>
            <div className="repo-card-top">
              <span className="repo-name">{r.name}</span>
              <ArrowUpRight width={16} height={16} />
            </div>
            <p className="repo-desc">{r.description}</p>
            <div className="repo-foot">
              {r.language && (
                <span>
                  <span className="lang-swatch" style={{ background: languageColor(r.language) }} />
                  {r.language}
                </span>
              )}
              {r.stargazers_count > 0 && (
                <span>
                  <Star width={13} height={13} /> {r.stargazers_count}
                </span>
              )}
              {isWithinDays(r.pushed_at, 180) && <span>Updated {timeAgo(r.pushed_at)}</span>}
            </div>
          </a>
        ))}
      </div>

      {feed.length > 0 && (
        <div className="feed" data-reveal>
          <h3 className="feed-title">Latest on GitHub</h3>
          <ol>
            {feed.map(({ e, text }) => (
              <li key={e.id}>
                <Commit width={16} height={16} className="feed-icon" />
                <span className="feed-text">{text}</span>
                <time dateTime={e.created_at} className="muted">
                  {timeAgo(e.created_at)}
                </time>
              </li>
            ))}
          </ol>
          <a className="text-link" href={profile.links.github} target="_blank" rel="noreferrer">
            All activity on GitHub →
          </a>
        </div>
      )}
    </div>
  );
}
