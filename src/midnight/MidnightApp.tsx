import { Fragment, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { GitHub, LinkedIn } from '../components/Icons';
import { education, experience, otherProjects, profile, projects, skills, type Project } from '../data/profile';
import { copyEmail, loadStylesheet } from '../lib/browser';
import { isWithinDays, languageColor, timeAgo, useGitHub, type GitHubData } from '../lib/github';
import { switchTheme } from '../themes';
import './midnight.css';

loadStylesheet('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');

export default function MidnightApp() {
  useReveal();
  useScrollToHashOnLoad();
  const [openProject, setOpenProject] = useState<Project | null>(null);

  return (
    <div className="mn">
      <div className="mn-ambient" aria-hidden />
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
    <header className="mn-nav-wrap">
      <nav className="mn-nav" aria-label="Main">
        <a href="/" className="mn-brand" onClick={goTop} title="Home">
          {profile.shortName}
        </a>
        <div className="mn-nav-links">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#github">GitHub</a>
          <a href="#contact">Contact</a>
        </div>
        <a href={profile.links.resume} target="_blank" rel="noreferrer" className="mn-btn mn-btn-sm">
          Resume
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="mn-hero" id="top">
      <div className="mn-hero-bg" aria-hidden>
        <div className="mn-glow mn-glow-a" />
        <div className="mn-glow mn-glow-b" />
      </div>
      <div className="mn-container mn-hero-inner">
        <span className="mn-pill mn-in" style={{ animationDelay: '0.05s' }}>
          <i aria-hidden /> {profile.status} · {profile.location.split(',')[0]}
        </span>
        <h1 className="mn-name mn-in" style={{ animationDelay: '0.12s' }}>
          {profile.name}
        </h1>
        <p className="mn-lead mn-in" style={{ animationDelay: '0.2s' }}>
          Software engineer at {profile.company}. <b>I build backend services and AI tools</b> that take manual work off engineering teams.
        </p>
        <div className="mn-hero-actions mn-in" style={{ animationDelay: '0.28s' }}>
          <a href="#work" className="mn-btn">
            View work
          </a>
          <a href={profile.links.resume} target="_blank" rel="noreferrer" className="mn-btn mn-btn-glass">
            Resume ↗
          </a>
          <span className="mn-hero-icons">
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
    <section className="mn-section mn-container" id={id}>
      <header className="mn-section-head" data-reveal>
        <div>
          <p className="mn-label">{label}</p>
          <h2>{title}</h2>
        </div>
        {aside && <span className="mn-aside">{aside}</span>}
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
    <div className={`mn-card ${className}`} onMouseMove={onMove} {...rest}>
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
      <div className="mn-grid">
        {projects.map((p) => {
          const stat = p.metrics.map(splitStat).find(Boolean) ?? null;
          return (
            <Card key={p.slug} className="mn-project" data-reveal>
              <button type="button" className="mn-project-hit" onClick={() => onOpen(p)} aria-label={`${p.title}: details`} />
              <p className="mn-meta">
                {p.kind} · {p.year}
              </p>
              <h3>{p.title}</h3>
              <p className="mn-project-summary">{p.summary}</p>
              {stat && (
                <p className="mn-stat">
                  <b>{stat[0]}</b> <span>{stat[1]}</span>
                </p>
              )}
              <div className="mn-chips">
                {p.stack.slice(0, 5).map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <span className="mn-more" aria-hidden>
                Details →
              </span>
            </Card>
          );
        })}
      </div>
      {otherProjects.map((o) => (
        <a key={o.title} className="mn-also" href={`${profile.links.github}/${o.repo}`} target="_blank" rel="noreferrer" data-reveal>
          <span className="mn-meta">Also</span>
          <b>{o.title}</b>
          <span className="mn-also-summary">{o.summary}</span>
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
      className="mn-dialog"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // backdrop
      }}
      aria-label={p ? p.title : 'Project details'}
    >
      {p && (
        <div className="mn-dialog-body" tabIndex={-1} autoFocus>
          <button type="button" className="mn-dialog-close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <p className="mn-meta">
            {p.kind} · {p.year}
          </p>
          <h3>{p.title}</h3>
          <p className="mn-dialog-summary">{p.summary}</p>

          <p className="mn-label">Pipeline</p>
          <ol className="mn-flow">
            {p.flow.map((step, i) => (
              <Fragment key={step}>
                {i > 0 && (
                  <li className="mn-flow-arrow" aria-hidden>
                    →
                  </li>
                )}
                <li className="mn-flow-step">{step}</li>
              </Fragment>
            ))}
          </ol>

          <div className="mn-dialog-cols">
            <div>
              <p className="mn-label">What I built</p>
              <ul className="mn-points">
                {p.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mn-label">Results</p>
              <ul className="mn-results">
                {p.metrics.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mn-chips">
            {p.stack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <div className="mn-dialog-links">
            {p.repo && (
              <a className="mn-btn mn-btn-sm" href={`${profile.links.github}/${p.repo}`} target="_blank" rel="noreferrer">
                View code ↗
              </a>
            )}
            {p.demo && (
              <a className="mn-btn mn-btn-sm mn-btn-glass" href={p.demo} target="_blank" rel="noreferrer">
                Live demo ↗
              </a>
            )}
            {p.private && <span className="mn-meta">Internal project · code is private</span>}
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
      <Card className="mn-panel" data-reveal>
        <ol className="mn-jobs">
          {experience.map((job) => (
            <li key={job.company} className="mn-job">
              <div className="mn-job-when">
                <span>{job.period}</span>
                <span>{job.location}</span>
              </div>
              <div>
                <h3>
                  {job.role} <span>· {job.company}</span>
                </h3>
                <ul className="mn-points">
                  {job.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <div className="mn-chips">
                  {job.stack.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              </div>
            </li>
          ))}
          <li className="mn-job">
            <div className="mn-job-when">
              <span>{education.period}</span>
              <span>Education</span>
            </div>
            <div>
              <h3>
                {education.degree} <span>· {education.school}</span>
              </h3>
              <p className="mn-job-note">
                {education.detail} · {education.certs.join(' · ')}
              </p>
            </div>
          </li>
        </ol>
      </Card>

      <div className="mn-skills">
        {skills.map((g) => (
          <Card key={g.group} className="mn-skill" data-reveal>
            <p className="mn-label">{g.group}</p>
            <div className="mn-chips">
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
      {gh.status === 'loading' && <p className="mn-muted">Loading repositories…</p>}
      {gh.status === 'error' && (
        <p className="mn-muted">
          GitHub didn't answer.{' '}
          <a className="mn-link" href={profile.links.github} target="_blank" rel="noreferrer">
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
    <div className="mn-gh" data-reveal>
      <div className="mn-gh-stats">
        <Card className="mn-tile">
          <p className="mn-label">Repositories</p>
          <b>{user.public_repos}</b>
        </Card>
        <Card className="mn-tile">
          <p className="mn-label">Languages</p>
          <b>{languages.length}</b>
        </Card>
        <Card className="mn-tile">
          <p className="mn-label">On GitHub since</p>
          <b>{new Date(user.created_at).getFullYear()}</b>
        </Card>
      </div>
      <Card className="mn-panel">
        {top.length > 0 && (
          <div className="mn-langs">
            <div className="mn-langbar">
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
        <ul className="mn-repos">
          {repos.slice(0, 8).map((r) => (
            <li key={r.name}>
              <a href={r.html_url} target="_blank" rel="noreferrer">
                <b>{r.name}</b>
                <span className="mn-repo-desc">{r.description ?? ''}</span>
                <span className="mn-meta">{r.language ?? ''}</span>
                <span className="mn-meta">{isWithinDays(r.pushed_at, 180) ? timeAgo(r.pushed_at) : ''}</span>
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
    <section className="mn-section mn-container" id="contact">
      <Card className="mn-contact" data-reveal>
        <div className="mn-glow mn-glow-c" aria-hidden />
        <p className="mn-label">Contact</p>
        <h2>Hiring for an SDE role? I'd like to hear about it.</h2>
        <a className="mn-email" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <div className="mn-contact-actions">
          <button
            type="button"
            className="mn-btn"
            onClick={async () => {
              if (await copyEmail()) {
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }
            }}
          >
            {copied ? 'Copied' : 'Copy email'}
          </button>
          <a className="mn-btn mn-btn-glass" href={profile.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
          <a className="mn-btn mn-btn-glass" href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </div>
      </Card>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mn-footer mn-container">
      <span>
        © {new Date().getFullYear()} {profile.name}
      </span>
      <span className="mn-footer-links">
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
      document.documentElement.classList.add('mn-still');
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
