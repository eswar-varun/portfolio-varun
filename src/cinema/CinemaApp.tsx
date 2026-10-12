import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { education, experience, otherProjects, profile, projects, skills, type Project } from '../data/profile';
import { copyEmail, loadStylesheet } from '../lib/browser';
import { isWithinDays, languageColor, timeAgo, useGitHub, type GitHubData } from '../lib/github';
import { switchTheme } from '../themes';
import './cinema.css';

loadStylesheet(
  'https://fonts.googleapis.com/css2?family=Michroma&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap',
);

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const COORDS = '13.0827° N  ·  80.2707° E';
const [FIRST, LAST] = profile.shortName.toUpperCase().split(' ');

export default function CinemaApp() {
  useReveal();
  useScrollToHashOnLoad();

  return (
    <div className="cn">
      <div className="cn-grain" aria-hidden />
      <div className="cn-vignette" aria-hidden />
      <TopBar />
      <main>
        <Hero />
        <Work />
        <Record />
        <Telemetry />
        <Contact />
      </main>
      <Credits />
    </div>
  );
}

/* ── Chrome ─────────────────────────────────────────────────────────────── */

function TopBar() {
  const time = useChennaiTime();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={`cn-top${scrolled ? ' is-scrolled' : ''}`}>
      <a
        href="/"
        className="cn-mark"
        title="Home"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          history.replaceState(null, '', window.location.pathname + window.location.search);
          window.scrollTo({ top: 0 });
        }}
      >
        {profile.name}
      </a>
      <span className="cn-top-coords" aria-hidden>
        {COORDS}
      </span>
      <nav className="cn-top-nav" aria-label="Sections">
        <a href="#work">Work</a>
        <a href="#record">Experience</a>
        <a href="#telemetry">GitHub</a>
        <a href="#contact">Contact</a>
      </nav>
      <span className="cn-top-clock" aria-label={`Local time in Chennai ${time}`}>
        CHN {time}
      </span>
      <a href={profile.links.resume} target="_blank" rel="noreferrer" className="cn-btn cn-btn-sm">
        Resume
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section className="cn-hero" id="top">
      <span className="cn-corner tl" aria-hidden />
      <span className="cn-corner tr" aria-hidden />
      <span className="cn-corner bl" aria-hidden />
      <span className="cn-corner br" aria-hidden />

      <div className="cn-hero-inner">
        <p className="cn-kicker cn-title-in" style={{ animationDelay: '0.2s' }}>
          {profile.role} <span className="cn-sep">/</span> {profile.location}
        </p>
        <h1 className="cn-name" aria-label={profile.name}>
          <span aria-hidden>{FIRST}</span> <span aria-hidden>{LAST}</span>
        </h1>
        <span className="cn-rule cn-title-in" style={{ animationDelay: '1.6s' }} aria-hidden />
        <p className="cn-headline cn-title-in" style={{ animationDelay: '1.9s' }}>
          {profile.headline}
        </p>
        <p className="cn-status cn-title-in" style={{ animationDelay: '2.2s' }}>
          <span className="cn-diamond" aria-hidden /> {profile.status}
        </p>
        <div className="cn-ctas cn-title-in" style={{ animationDelay: '2.4s' }}>
          <a href="#work" className="cn-btn">
            View work
          </a>
          <a href={profile.links.resume} target="_blank" rel="noreferrer" className="cn-btn cn-btn-ghost">
            Resume ↗
          </a>
        </div>
      </div>

      <svg className="cn-horizon" viewBox="0 0 1600 400" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="cn-arc" x1="0" x2="1">
            <stop offset="0" stopColor="#f0a35e" stopOpacity="0" />
            <stop offset="0.5" stopColor="#f0a35e" stopOpacity="0.9" />
            <stop offset="1" stopColor="#f0a35e" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="cn-glow" cx="0.5" cy="1" r="0.7">
            <stop offset="0" stopColor="#f0a35e" stopOpacity="0.16" />
            <stop offset="1" stopColor="#f0a35e" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="800" cy="1180" rx="1300" ry="900" fill="url(#cn-glow)" />
        <ellipse cx="800" cy="1180" rx="1300" ry="900" fill="#07080a" stroke="url(#cn-arc)" strokeWidth="1.5" />
      </svg>

      <a href="#work" className="cn-scroll" aria-label="Scroll to work">
        <span>Scroll</span>
        <i aria-hidden />
      </a>
    </section>
  );
}

function Chapter({ n, title, meta, children, id }: { n: number; title: string; meta?: string; children: ReactNode; id: string }) {
  return (
    <section className="cn-section" id={id}>
      <header className="cn-chapter" data-reveal>
        <span className="cn-chapter-n">{NUMERALS[n - 1]}</span>
        <h2>{title}</h2>
        <span className="cn-chapter-line" aria-hidden />
        {meta && <span className="cn-chapter-meta">{meta}</span>}
      </header>
      {children}
    </section>
  );
}

/* ── Work ───────────────────────────────────────────────────────────────── */

function Work() {
  const [open, setOpen] = useState<string | null>(projects[0]?.slug ?? null);
  return (
    <Chapter n={1} id="work" title="Selected work" meta={`${projects.length} projects`}>
      <ol className="cn-projects">
        {projects.map((p, i) => (
          <ProjectRow key={p.slug} p={p} n={i + 1} open={open === p.slug} onToggle={() => setOpen((s) => (s === p.slug ? null : p.slug))} />
        ))}
      </ol>
      {otherProjects.map((o) => (
        <a key={o.title} className="cn-also" href={`${profile.links.github}/${o.repo}`} target="_blank" rel="noreferrer" data-reveal>
          <span className="cn-label">Also</span>
          <span className="cn-also-title">{o.title}</span>
          <span className="cn-also-summary">{o.summary}</span>
          <span aria-hidden>↗</span>
        </a>
      ))}
    </Chapter>
  );
}

function ProjectRow({ p, n, open, onToggle }: { p: Project; n: number; open: boolean; onToggle: () => void }) {
  const id = `cn-proj-${p.slug}`;
  return (
    <li className={`cn-project${open ? ' is-open' : ''}`} data-reveal>
      <button type="button" className="cn-project-row" onClick={onToggle} aria-expanded={open} aria-controls={id}>
        <span className="cn-project-n">{NUMERALS[n - 1]}</span>
        <span className="cn-project-title">{p.title}</span>
        <span className="cn-project-meta">
          {p.kind}
          <span className="cn-sep"> / </span>
          {p.year}
        </span>
        <span className="cn-toggle" aria-hidden />
      </button>
      <div className="cn-project-body" id={id} hidden={!open}>
        <p className="cn-project-summary">{p.summary}</p>

        <div className="cn-label">Trajectory</div>
        <ol className="cn-trajectory">
          {p.flow.map((step) => (
            <li key={step}>
              <span className="cn-node" aria-hidden />
              <span className="cn-node-label">{step}</span>
            </li>
          ))}
        </ol>

        <div className="cn-project-cols">
          <div>
            <div className="cn-label">What I built</div>
            <ul className="cn-points">
              {p.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="cn-label">Results</div>
            <ul className="cn-results">
              {p.metrics.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            <div className="cn-label">Stack</div>
            <p className="cn-stack">{p.stack.join('  ·  ')}</p>
            <p className="cn-links">
              {p.repo && (
                <a href={`${profile.links.github}/${p.repo}`} target="_blank" rel="noreferrer">
                  View code ↗
                </a>
              )}
              {p.demo && (
                <a href={p.demo} target="_blank" rel="noreferrer">
                  Live demo ↗
                </a>
              )}
              {p.private && <span className="cn-dim">Internal project · code is private</span>}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}

/* ── Experience ─────────────────────────────────────────────────────────── */

function Record() {
  return (
    <Chapter n={2} id="record" title="Experience" meta={`${experience.length} roles`}>
      <ol className="cn-timeline">
        {experience.map((job) => (
          <li key={job.company} className="cn-entry" data-reveal>
            <span className="cn-entry-node" aria-hidden />
            <div className="cn-entry-period">
              {job.period}
              <span className="cn-dim"> · {job.location}</span>
            </div>
            <h3>
              {job.role}
              <span>{job.company}</span>
            </h3>
            <ul className="cn-points">
              {job.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
            <p className="cn-stack">{job.stack.join('  ·  ')}</p>
          </li>
        ))}
        <li className="cn-entry" data-reveal>
          <span className="cn-entry-node" aria-hidden />
          <div className="cn-entry-period">
            {education.period}
            <span className="cn-dim"> · Education</span>
          </div>
          <h3>
            {education.degree}
            <span>{education.school}</span>
          </h3>
          <p className="cn-entry-note">
            {education.detail} · {education.certs.join(' · ')}
          </p>
        </li>
      </ol>

      <div className="cn-skills" data-reveal>
        {skills.map((g) => (
          <div key={g.group} className="cn-skill">
            <div className="cn-label">{g.group}</div>
            <ul>
              {g.items.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Chapter>
  );
}

/* ── GitHub telemetry ───────────────────────────────────────────────────── */

function Telemetry() {
  const gh = useGitHub(profile.githubUser);
  return (
    <Chapter n={3} id="telemetry" title="GitHub" meta="Live telemetry">
      {gh.status === 'loading' && <p className="cn-dim cn-mono">Establishing link…</p>}
      {gh.status === 'error' && (
        <p className="cn-dim cn-mono">
          Signal lost. GitHub didn't answer.{' '}
          <a className="cn-inline" href={profile.links.github} target="_blank" rel="noreferrer">
            Open profile ↗
          </a>
        </p>
      )}
      {gh.status === 'ready' && <TelemetryReadout data={gh.data} />}
    </Chapter>
  );
}

function TelemetryReadout({ data }: { data: GitHubData }) {
  const { user, repos, languages } = data;
  const total = languages.reduce((s, l) => s + l.bytes, 0) || 1;
  const top = languages.slice(0, 5);
  return (
    <div data-reveal>
      <dl className="cn-readouts">
        <div>
          <dt>Repositories</dt>
          <dd>{String(user.public_repos).padStart(2, '0')}</dd>
        </div>
        <div>
          <dt>Languages</dt>
          <dd>{String(languages.length).padStart(2, '0')}</dd>
        </div>
        <div>
          <dt>Active since</dt>
          <dd>{new Date(user.created_at).getFullYear()}</dd>
        </div>
      </dl>
      {top.length > 0 && (
        <div className="cn-spectrum">
          <div className="cn-label">Language spectrum</div>
          <div className="cn-spectrum-bar">
            {top.map((l) => (
              <span key={l.name} style={{ flexGrow: l.bytes, background: languageColor(l.name) }} />
            ))}
          </div>
          <ul className="cn-spectrum-legend">
            {top.map((l) => (
              <li key={l.name}>
                <i style={{ background: languageColor(l.name) }} />
                {l.name} <span className="cn-dim">{Math.round((l.bytes / total) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul className="cn-repos">
        {repos.slice(0, 8).map((r) => (
          <li key={r.name}>
            <a href={r.html_url} target="_blank" rel="noreferrer">
              <span className="cn-repo-name">{r.name}</span>
              <span className="cn-repo-desc">{r.description ?? ''}</span>
              <span className="cn-repo-lang">{r.language ?? ''}</span>
              <span className="cn-repo-time">{isWithinDays(r.pushed_at, 180) ? timeAgo(r.pushed_at) : ''}</span>
              <span aria-hidden>↗</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Contact & credits ──────────────────────────────────────────────────── */

function Contact() {
  const [copied, setCopied] = useState(false);
  return (
    <Chapter n={4} id="contact" title="Contact" meta="Email is fastest">
      <div className="cn-contact" data-reveal>
        <a className="cn-email" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <div className="cn-contact-actions">
          <button
            type="button"
            className="cn-btn"
            onClick={async () => {
              if (await copyEmail()) {
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }
            }}
          >
            {copied ? 'Copied' : 'Copy email'}
          </button>
          <a className="cn-btn cn-btn-ghost" href={profile.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
          <a className="cn-btn cn-btn-ghost" href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <a className="cn-btn cn-btn-ghost" href={profile.links.resume} target="_blank" rel="noreferrer">
            Resume ↗
          </a>
        </div>
      </div>
    </Chapter>
  );
}

function Credits() {
  const lines: [string, ReactNode][] = [
    ['Engineer', profile.name],
    ['Based in', profile.location],
    ['Built with', 'React · TypeScript · GitHub API'],
  ];
  return (
    <footer className="cn-credits">
      <dl>
        {lines.map(([k, v]) => (
          <Fragment key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </Fragment>
        ))}
        {profile.sourceRepo && (
          <>
            <dt>Source</dt>
            <dd>
              <a href={profile.sourceRepo} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
            </dd>
          </>
        )}
      </dl>
      <button type="button" className="cn-credits-theme" onClick={() => switchTheme('ide')}>
        View as editor
      </button>
      <p className="cn-credits-end">© {new Date().getFullYear()}</p>
    </footer>
  );
}

/* ── Hooks ──────────────────────────────────────────────────────────────── */

function useChennaiTime() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = window.setInterval(() => setT(fmt()), 15_000);
    return () => window.clearInterval(id);
  }, []);
  return t;
}

/** Slow fade-up for [data-reveal] elements as they enter the viewport. */
function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('cn-still');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px' },
    );
    const scan = () => document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}

// The page renders after the browser's own jump to #section, so do it here,
// and again once GitHub data arrives (it sits above Contact) unless the
// visitor has started scrolling.
function useScrollToHashOnLoad() {
  const gh = useGitHub(profile.githubUser);
  const touched = useRef(false);

  useEffect(() => {
    const stop = () => (touched.current = true);
    window.addEventListener('wheel', stop, { passive: true, once: true });
    window.addEventListener('touchmove', stop, { passive: true, once: true });
    window.addEventListener('keydown', stop, { once: true });
    return () => {
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
      window.removeEventListener('keydown', stop);
    };
  }, []);

  useEffect(() => {
    if (touched.current) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.querySelectorAll('[data-reveal]').forEach((r) => r.classList.add('is-in'));
    el.scrollIntoView({ behavior: 'instant' });
  }, [gh.status]);
}
