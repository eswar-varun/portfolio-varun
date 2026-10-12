import { Fragment, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { GitHub, LinkedIn } from '../components/Icons';
import { education, experience, otherProjects, profile, projects, skills, type Project } from '../data/profile';
import { copyEmail } from '../lib/browser';
import { isWithinDays, languageColor, timeAgo, useGitHub, type GitHubData } from '../lib/github';
import { switchTheme } from '../themes';
import './aurora.css';

export default function AuroraApp() {
  useReveal();
  useScrollToHashOnLoad();
  const [openProject, setOpenProject] = useState<Project | null>(null);

  return (
    <div className="au">
      <div className="au-ambient" aria-hidden />
      <Nav />
      <main>
        <Hero />
        <Work onOpen={setOpenProject} />
        <Experience />
        <GitHubSection />
        <Contact />
      </main>
      <Footer />
      <ProjectDialog project={openProject} onClose={() => setOpenProject(null)} />
    </div>
  );
}

/* ── Nav & hero ─────────────────────────────────────────────────────────── */

function goTop(e: ReactMouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  history.replaceState(null, '', window.location.pathname + window.location.search);
  window.scrollTo({ top: 0 });
}

function Nav() {
  return (
    <header className="au-nav-wrap">
      <nav className="au-nav" aria-label="Main">
        <a href="/" className="au-brand" onClick={goTop} title="Home">
          {profile.shortName}
        </a>
        <div className="au-nav-links">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#github">GitHub</a>
          <a href="#contact">Contact</a>
        </div>
        <a href={profile.links.resume} target="_blank" rel="noreferrer" className="au-btn au-btn-sm">
          Resume
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="au-hero" id="top">
      <div className="au-hero-bg" aria-hidden>
        <div className="au-glow au-glow-a" />
        <div className="au-glow au-glow-b" />
      </div>
      <div className="au-container au-hero-inner">
        <span className="au-pill au-in" style={{ animationDelay: '0.05s' }}>
          <i aria-hidden /> {profile.status} · {profile.location.split(',')[0]}
        </span>
        <h1 className="au-name au-in" style={{ animationDelay: '0.12s' }}>
          {profile.name}
        </h1>
        <p className="au-lead au-in" style={{ animationDelay: '0.2s' }}>
          Software engineer at {profile.company}. <b>I build backend services and AI tools</b> that take manual work off engineering teams.
        </p>
        <div className="au-hero-actions au-in" style={{ animationDelay: '0.28s' }}>
          <a href="#work" className="au-btn">
            View work
          </a>
          <a href={profile.links.resume} target="_blank" rel="noreferrer" className="au-btn au-btn-glass">
            Resume ↗
          </a>
          <span className="au-hero-icons">
            <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <GitHub width={18} height={18} />
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <LinkedIn width={18} height={18} />
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}

function Section({ id, label, title, aside, children }: { id: string; label: string; title: string; aside?: string; children: ReactNode }) {
  return (
    <section className="au-section au-container" id={id}>
      <header className="au-section-head" data-reveal>
        <div>
          <p className="au-label">{label}</p>
          <h2>{title}</h2>
        </div>
        {aside && <span className="au-aside">{aside}</span>}
      </header>
      {children}
    </section>
  );
}

/** A glass card with a soft spotlight that follows the pointer. */
function Card({ className = '', children, ...rest }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <div className={`au-card ${className}`} onMouseMove={onMove} {...rest}>
      {children}
    </div>
  );
}

/* ── Work ───────────────────────────────────────────────────────────────── */

// "80% less manual effort" → ["80%", "less manual effort"]
function splitStat(s: string): [string, string] | null {
  const m = s.match(/^([~<>]?[\d.,]+\s?(?:%|\+|ms)?\+?)\s+(.*)$/);
  return m ? [m[1].replace(/\s/g, ''), m[2]] : null;
}

function Work({ onOpen }: { onOpen: (p: Project) => void }) {
  return (
    <Section id="work" label="Selected work" title="What I've been building" aside={`${projects.length} projects`}>
      <div className="au-grid">
        {projects.map((p) => {
          const stat = p.metrics.map(splitStat).find(Boolean) ?? null;
          return (
            <Card key={p.slug} className="au-project" data-reveal>
              <button type="button" className="au-project-hit" onClick={() => onOpen(p)} aria-label={`${p.title}: details`} />
              <p className="au-meta">
                {p.kind} · {p.year}
              </p>
              <h3>{p.title}</h3>
              <p className="au-project-summary">{p.summary}</p>
              {stat && (
                <p className="au-stat">
                  <b>{stat[0]}</b> <span>{stat[1]}</span>
                </p>
              )}
              <div className="au-chips">
                {p.stack.slice(0, 5).map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <span className="au-more" aria-hidden>
                Details →
              </span>
            </Card>
          );
        })}
      </div>
      {otherProjects.map((o) => (
        <a key={o.title} className="au-also" href={`${profile.links.github}/${o.repo}`} target="_blank" rel="noreferrer" data-reveal>
          <span className="au-meta">Also</span>
          <b>{o.title}</b>
          <span className="au-also-summary">{o.summary}</span>
          <span aria-hidden>↗</span>
        </a>
      ))}
    </Section>
  );
}

function ProjectDialog({ project: p, onClose }: { project: Project | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (p && !d.open) d.showModal();
    if (!p && d.open) d.close();
  }, [p]);

  return (
    <dialog
      ref={ref}
      className="au-dialog"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // backdrop
      }}
      aria-label={p ? p.title : 'Project details'}
    >
      {p && (
        <div className="au-dialog-body" tabIndex={-1} autoFocus>
          <button type="button" className="au-dialog-close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <p className="au-meta">
            {p.kind} · {p.year}
          </p>
          <h3>{p.title}</h3>
          <p className="au-dialog-summary">{p.summary}</p>

          <p className="au-label">Pipeline</p>
          <ol className="au-flow">
            {p.flow.map((step, i) => (
              <Fragment key={step}>
                {i > 0 && (
                  <li className="au-flow-arrow" aria-hidden>
                    →
                  </li>
                )}
                <li className="au-flow-step">{step}</li>
              </Fragment>
            ))}
          </ol>

          <div className="au-dialog-cols">
            <div>
              <p className="au-label">What I built</p>
              <ul className="au-points">
                {p.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="au-label">Results</p>
              <ul className="au-results">
                {p.metrics.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="au-chips">
            {p.stack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <div className="au-dialog-links">
            {p.repo && (
              <a className="au-btn au-btn-sm" href={`${profile.links.github}/${p.repo}`} target="_blank" rel="noreferrer">
                View code ↗
              </a>
            )}
            {p.demo && (
              <a className="au-btn au-btn-sm au-btn-glass" href={p.demo} target="_blank" rel="noreferrer">
                Live demo ↗
              </a>
            )}
            {p.private && <span className="au-meta">Internal project · code is private</span>}
          </div>
        </div>
      )}
    </dialog>
  );
}

/* ── Experience ─────────────────────────────────────────────────────────── */

function Experience() {
  return (
    <Section id="experience" label="Experience" title="Where I've worked">
      <Card className="au-panel" data-reveal>
        <ol className="au-jobs">
          {experience.map((job) => (
            <li key={job.company} className="au-job">
              <div className="au-job-when">
                <span>{job.period}</span>
                <span>{job.location}</span>
              </div>
              <div>
                <h3>
                  {job.role} <span>· {job.company}</span>
                </h3>
                <ul className="au-points">
                  {job.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <div className="au-chips">
                  {job.stack.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              </div>
            </li>
          ))}
          <li className="au-job">
            <div className="au-job-when">
              <span>{education.period}</span>
              <span>Education</span>
            </div>
            <div>
              <h3>
                {education.degree} <span>· {education.school}</span>
              </h3>
              <p className="au-job-note">
                {education.detail} · {education.certs.join(' · ')}
              </p>
            </div>
          </li>
        </ol>
      </Card>

      <div className="au-skills">
        {skills.map((g) => (
          <Card key={g.group} className="au-skill" data-reveal>
            <p className="au-label">{g.group}</p>
            <div className="au-chips">
              {g.items.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ── GitHub ─────────────────────────────────────────────────────────────── */

function GitHubSection() {
  const gh = useGitHub(profile.githubUser);
  return (
    <Section id="github" label="Open source" title="On GitHub" aside="Live from the API">
      {gh.status === 'loading' && <p className="au-muted">Loading repositories…</p>}
      {gh.status === 'error' && (
        <p className="au-muted">
          GitHub didn't answer.{' '}
          <a className="au-link" href={profile.links.github} target="_blank" rel="noreferrer">
            Open my profile ↗
          </a>
        </p>
      )}
      {gh.status === 'ready' && <GitHubPanel data={gh.data} />}
    </Section>
  );
}

function GitHubPanel({ data }: { data: GitHubData }) {
  const { user, repos, languages } = data;
  const total = languages.reduce((s, l) => s + l.bytes, 0) || 1;
  const top = languages.slice(0, 5);
  return (
    <div className="au-gh" data-reveal>
      <div className="au-gh-stats">
        <Card className="au-tile">
          <p className="au-label">Repositories</p>
          <b>{user.public_repos}</b>
        </Card>
        <Card className="au-tile">
          <p className="au-label">Languages</p>
          <b>{languages.length}</b>
        </Card>
        <Card className="au-tile">
          <p className="au-label">On GitHub since</p>
          <b>{new Date(user.created_at).getFullYear()}</b>
        </Card>
      </div>
      <Card className="au-panel">
        {top.length > 0 && (
          <div className="au-langs">
            <div className="au-langbar">
              {top.map((l) => (
                <span key={l.name} style={{ flexGrow: l.bytes, background: languageColor(l.name) }} />
              ))}
            </div>
            <ul>
              {top.map((l) => (
                <li key={l.name}>
                  <i style={{ background: languageColor(l.name) }} />
                  {l.name} <span>{Math.round((l.bytes / total) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <ul className="au-repos">
          {repos.slice(0, 8).map((r) => (
            <li key={r.name}>
              <a href={r.html_url} target="_blank" rel="noreferrer">
                <b>{r.name}</b>
                <span className="au-repo-desc">{r.description ?? ''}</span>
                <span className="au-meta">{r.language ?? ''}</span>
                <span className="au-meta">{isWithinDays(r.pushed_at, 180) ? timeAgo(r.pushed_at) : ''}</span>
                <span aria-hidden>↗</span>
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ── Contact & footer ───────────────────────────────────────────────────── */

function Contact() {
  const [copied, setCopied] = useState(false);
  return (
    <section className="au-section au-container" id="contact">
      <Card className="au-contact" data-reveal>
        <div className="au-glow au-glow-c" aria-hidden />
        <p className="au-label">Contact</p>
        <h2>Hiring for an SDE role? I'd like to hear about it.</h2>
        <a className="au-email" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <div className="au-contact-actions">
          <button
            type="button"
            className="au-btn"
            onClick={async () => {
              if (await copyEmail()) {
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }
            }}
          >
            {copied ? 'Copied' : 'Copy email'}
          </button>
          <a className="au-btn au-btn-glass" href={profile.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
          <a className="au-btn au-btn-glass" href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </div>
      </Card>
    </section>
  );
}

function Footer() {
  return (
    <footer className="au-footer au-container">
      <span>
        © {new Date().getFullYear()} {profile.name}
      </span>
      <span className="au-footer-links">
        {profile.sourceRepo && (
          <a href={profile.sourceRepo} target="_blank" rel="noreferrer">
            Source
          </a>
        )}
        <button type="button" onClick={() => switchTheme('ide')}>
          View as editor
        </button>
        <a href="/" onClick={goTop}>
          Back to top ↑
        </a>
      </span>
    </footer>
  );
}

/* ── Hooks ──────────────────────────────────────────────────────────────── */

/** Fade-up for [data-reveal] elements as they enter the viewport. */
function useReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('au-still');
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
