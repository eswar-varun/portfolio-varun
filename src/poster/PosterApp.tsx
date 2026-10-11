import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { education, experience, otherProjects, profile, projects, skills, type Project } from '../data/profile';
import { copyEmail, loadStylesheet } from '../lib/browser';
import { isWithinDays, languageColor, timeAgo, useGitHub } from '../lib/github';
import { THEMES, switchTheme } from '../themes';
import './poster.css';

loadStylesheet('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap');

const [first, last] = profile.shortName.toUpperCase().split(' ');

export default function PosterApp() {
  useScrollToHashOnLoad();
  return (
    <div className="poster" id="top">
      <TopBar />
      <main>
        <Hero />
        <Work />
        <Experience />
        <GitHubSection />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

// The page renders after the browser's own jump to #section, so do it
// here, and again once the GitHub data (which sits above Contact) arrives,
// unless the visitor has started scrolling by then.
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
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
  }, [gh.status]);
}

function TopBar() {
  return (
    <header className="p-top">
      <a
        href="/"
        className="p-top-name"
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
      <nav className="p-top-nav" aria-label="Sections">
        <a href="#work">Work</a>
        <a href="#experience">Experience</a>
        <a href="#github">GitHub</a>
        <a href="#contact">Contact</a>
      </nav>
      <button type="button" className="p-top-theme" onClick={() => switchTheme('ide')} title="Switch to the editor theme">
        Editor<span className="p-hide-sm">&nbsp;view</span>
      </button>
      <a href={profile.links.resume} target="_blank" rel="noreferrer" className="p-top-cta">
        Resume ↗
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section className="p-hero">
      <FittedName />

      <dl className="p-meta">
        <div>
          <dt>Role</dt>
          <dd>{profile.role}</dd>
        </div>
        <div>
          <dt>Company</dt>
          <dd>{profile.company}</dd>
        </div>
        <div>
          <dt>Based in</dt>
          <dd>{profile.location}</dd>
        </div>
        <div className="p-meta-status">
          <dt>Status</dt>
          <dd>
            <i className="p-dot" aria-hidden />
            {profile.status}
          </dd>
        </div>
      </dl>

      <div className="p-statement">
        <p className="p-headline">{profile.headline}</p>
        <p className="p-intro">{profile.intro}</p>
      </div>

    </section>
  );
}

/** The name, scaled so it spans the full width at any screen size. */
function FittedName() {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const h1 = ref.current;
    if (!h1) return;
    const inner = h1.firstElementChild as HTMLElement;
    let lastWidth = -1;
    // Text width scales linearly with font size, so scale from the current
    // size in one step. Never shrink-then-grow: on phones that briefly
    // shortens the page and the browser shifts the scroll position.
    const fit = (force = false) => {
      const width = h1.clientWidth;
      // Mobile address bars resize the viewport height only; ignore those.
      if (!force && width === lastWidth) return;
      lastWidth = width;
      const current = parseFloat(getComputedStyle(h1).fontSize);
      const w = inner.getBoundingClientRect().width;
      if (!w || !current) return;
      const next = Math.floor((current * width) / w);
      if (next !== Math.floor(current)) h1.style.fontSize = `${next}px`;
    };
    const onResize = () => fit();
    fit(true);
    document.fonts?.ready.then(() => fit(true));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <h1 className="p-name" ref={ref} aria-label={profile.name}>
      <span className="p-name-inner" aria-hidden>
        <span>{first}</span>
        <span>
          {last}
          <i className="p-square" />
        </span>
      </span>
    </h1>
  );
}

function SectionHead({ title, aside }: { title: string; aside: string }) {
  return (
    <div className="p-head">
      <h2>{title}</h2>
      <span>{aside}</span>
    </div>
  );
}

function Work() {
  const [openSlug, setOpenSlug] = useState<string | null>(projects[0]?.slug ?? null);

  return (
    <section className="p-section" id="work">
      <SectionHead title="Work" aside={`${projects.length + otherProjects.length} projects`} />
      <ol className="p-projects">
        {projects.map((p, i) => (
          <ProjectRow
            key={p.slug}
            project={p}
            index={i + 1}
            open={openSlug === p.slug}
            onToggle={() => setOpenSlug((s) => (s === p.slug ? null : p.slug))}
          />
        ))}
      </ol>
      {otherProjects.length > 0 && (
        <ul className="p-other">
          {otherProjects.map((o) => (
            <li key={o.title}>
              <a href={`${profile.links.github}/${o.repo}`} target="_blank" rel="noreferrer">
                <span className="p-other-label">Also</span>
                <span className="p-other-title">{o.title}</span>
                <span className="p-other-summary">{o.summary}</span>
                <span className="p-arrow">↗</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ProjectRow({ project: p, index, open, onToggle }: { project: Project; index: number; open: boolean; onToggle: () => void }) {
  const panelId = `proj-${p.slug}`;
  return (
    <li className={`p-project${open ? ' is-open' : ''}`}>
      <button type="button" className="p-project-row" onClick={onToggle} aria-expanded={open} aria-controls={panelId}>
        <span className="p-project-index">{String(index).padStart(2, '0')}</span>
        <span className="p-project-title">{p.title}</span>
        <span className="p-project-kind">
          {p.kind}
          <br />
          {p.year}
        </span>
        <span className="p-toggle" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      <p className="p-project-summary">{p.summary}</p>

      <div className="p-project-body" id={panelId} hidden={!open}>
        <div className="p-col">
          <h3>Pipeline</h3>
          <ol className="p-flow">
            {p.flow.map((step, i) => (
              <li key={step}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="p-col">
          <h3>What I built</h3>
          <ul className="p-points">
            {p.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
        </div>
        <div className="p-col">
          <h3>Results</h3>
          <ul className="p-results">
            {p.metrics.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <h3>Stack</h3>
          <p className="p-stack">{p.stack.join(' / ')}</p>
          <p className="p-links">
            {p.repo && (
              <a href={`${profile.links.github}/${p.repo}`} target="_blank" rel="noreferrer">
                Code ↗
              </a>
            )}
            {p.demo && (
              <a href={p.demo} target="_blank" rel="noreferrer">
                Live demo ↗
              </a>
            )}
            {p.private && <span className="p-muted">Internal project, code is private</span>}
          </p>
        </div>
      </div>
    </li>
  );
}

function Experience() {
  return (
    <section className="p-section" id="experience">
      <SectionHead title="Experience" aside={`${experience.length} roles`} />
      <ol className="p-jobs">
        {experience.map((job) => (
          <li key={job.company} className="p-job">
            <div className="p-job-period">{job.period}</div>
            <div className="p-job-main">
              <h3>
                {job.role}
                <span>{job.company}</span>
              </h3>
              <ul className="p-points">
                {job.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
              <p className="p-stack">{job.stack.join(' / ')}</p>
            </div>
            <div className="p-job-loc">{job.location}</div>
          </li>
        ))}
        <li className="p-job">
          <div className="p-job-period">{education.period}</div>
          <div className="p-job-main">
            <h3>
              {education.degree}
              <span>{education.school}</span>
            </h3>
            <p className="p-job-note">
              {education.detail} / {education.certs.join(' / ')}
            </p>
          </div>
          <div className="p-job-loc">Education</div>
        </li>
      </ol>

      <div className="p-skills">
        {skills.map((g) => (
          <div key={g.group}>
            <h3>{g.group}</h3>
            <ul>
              {g.items.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function GitHubSection() {
  const gh = useGitHub(profile.githubUser);

  return (
    <section className="p-section" id="github">
      <SectionHead title="GitHub" aside="Live from the API" />

      {gh.status === 'loading' && <p className="p-muted p-pad">Loading repositories…</p>}
      {gh.status === 'error' && (
        <p className="p-muted p-pad">
          GitHub didn't answer.{' '}
          <a href={profile.links.github} target="_blank" rel="noreferrer" className="p-inline-link">
            See my profile ↗
          </a>
        </p>
      )}
      {gh.status === 'ready' && (() => {
        const { user, repos, languages } = gh.data;
        const total = languages.reduce((s, l) => s + l.bytes, 0) || 1;
        return (
          <>
            <dl className="p-gh-stats">
              <div>
                <dt>Repos</dt>
                <dd>{user.public_repos}</dd>
              </div>
              <div>
                <dt>Languages</dt>
                <dd>{languages.length}</dd>
              </div>
              <div>
                <dt>Since</dt>
                <dd>{new Date(user.created_at).getFullYear()}</dd>
              </div>
              <div className="p-gh-langs">
                <dt>Language mix</dt>
                <dd>
                  <span className="p-langbar">
                    {languages.slice(0, 5).map((l) => (
                      <span key={l.name} style={{ flexGrow: l.bytes, background: languageColor(l.name) }} title={l.name} />
                    ))}
                  </span>
                  <span className="p-langlist">
                    {languages
                      .slice(0, 5)
                      .map((l) => `${l.name} ${Math.round((l.bytes / total) * 100)}%`)
                      .join(' / ')}
                  </span>
                </dd>
              </div>
            </dl>
            <ul className="p-repos">
              {repos.slice(0, 8).map((r) => (
                <li key={r.name}>
                  <a href={r.html_url} target="_blank" rel="noreferrer">
                    <span className="p-repo-name">{r.name}</span>
                    <span className="p-repo-desc">{r.description ?? ''}</span>
                    <span className="p-repo-lang">{r.language ?? ''}</span>
                    <span className="p-repo-time">{isWithinDays(r.pushed_at, 180) ? timeAgo(r.pushed_at) : ''}</span>
                    <span className="p-arrow">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        );
      })()}
    </section>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  return (
    <section className="p-section p-contact" id="contact">
      <SectionHead title="Contact" aside="Email is fastest" />
      <a className="p-email" href={`mailto:${profile.email}`}>
        {profile.email}
      </a>
      <div className="p-contact-row">
        <button
          type="button"
          onClick={async () => {
            if (await copyEmail()) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }
          }}
        >
          {copied ? 'Copied' : 'Copy email'}
        </button>
        <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
          LinkedIn ↗
        </a>
        <a href={profile.links.github} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
        <a href={profile.links.resume} target="_blank" rel="noreferrer">
          Resume ↗
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="p-footer">
      <span>
        © {new Date().getFullYear()} {profile.name}
      </span>
      <span>
        React / TypeScript / GitHub API
        {profile.sourceRepo && (
          <>
            {' / '}
            <a href={profile.sourceRepo} target="_blank" rel="noreferrer">
              Source ↗
            </a>
          </>
        )}
      </span>
      <span className="p-footer-themes">
        Theme:{' '}
        {THEMES.map((t, i) => (
          <span key={t.id}>
            {i > 0 && ' / '}
            {t.id === 'poster' ? (
              <b>{t.label}</b>
            ) : (
              <button type="button" onClick={() => switchTheme(t.id)}>
                {t.label}
              </button>
            )}
          </span>
        ))}
      </span>
      <a href="#top">Back to top ↑</a>
    </footer>
  );
}
