import { Fragment } from 'react';
import { otherProjects, profile, projects, type Project } from '../data/profile';
import { isWithinDays, timeAgo, useGitHub, type GhRepo } from '../lib/github';
import { ArrowUpRight, GitHub, Lock, Star } from './Icons';
import { SectionHead } from './SectionHead';

export function Work() {
  const gh = useGitHub(profile.githubUser);
  const repoByName = new Map<string, GhRepo>(
    gh.status === 'ready' ? gh.data.repos.map((r) => [r.name.toLowerCase(), r]) : [],
  );

  return (
    <section className="section" id="work">
      <div className="container">
        <SectionHead index="01" label="Selected work" title="Things I've built" />

        <div className="projects">
          {projects.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i + 1} repo={p.repo ? repoByName.get(p.repo.toLowerCase()) : undefined} />
          ))}
        </div>

        {otherProjects.length > 0 && (
          <div className="other" data-reveal>
            <h3 className="other-title">Also</h3>
            <ul>
              {otherProjects.map((o) => (
                <li key={o.title}>
                  <a href={`${profile.links.github}/${o.repo}`} target="_blank" rel="noreferrer" className="other-link">
                    <span className="other-name">{o.title}</span>
                    <span className="other-summary">{o.summary}</span>
                    <span className="other-stack">{o.stack.join(' · ')}</span>
                    <ArrowUpRight width={16} height={16} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({ project: p, index, repo }: { project: Project; index: number; repo?: GhRepo }) {
  const repoUrl = p.repo ? `${profile.links.github}/${p.repo}` : undefined;

  return (
    <article className="project" data-reveal>
      <header className="project-head">
        <span className="project-index">{String(index).padStart(2, '0')}</span>
        <span className="project-kind">{p.kind}</span>
        <div className="project-links">
          {repo && (repo.stargazers_count > 0 || isWithinDays(repo.pushed_at, 180)) && (
            <span className="repo-meta" title={`Last updated ${timeAgo(repo.pushed_at)}`}>
              {repo.stargazers_count > 0 && (
                <>
                  <Star width={14} height={14} /> {repo.stargazers_count} ·{' '}
                </>
              )}
              updated {timeAgo(repo.pushed_at)}
            </span>
          )}
          {p.demo && (
            <a href={p.demo} target="_blank" rel="noreferrer" className="chip-link">
              Live demo <ArrowUpRight width={14} height={14} />
            </a>
          )}
          {repoUrl && (
            <a href={repoUrl} target="_blank" rel="noreferrer" className="chip-link">
              <GitHub width={14} height={14} /> Code
            </a>
          )}
          {p.privateNote && (
            <span className="private-note">
              <Lock width={14} height={14} /> {p.privateNote}
            </span>
          )}
        </div>
      </header>

      <h3 className="project-title">{p.title}</h3>
      <p className="project-summary">{p.summary}</p>

      <ol className="flow" aria-label={`${p.title} pipeline`}>
        {p.flow.map((step, i) => (
          <Fragment key={step}>
            {i > 0 && (
              <li className="flow-arrow" aria-hidden>
                <svg width="22" height="10" viewBox="0 0 22 10">
                  <path d="M0 5h19M15 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </li>
            )}
            <li className="flow-step">{step}</li>
          </Fragment>
        ))}
      </ol>

      <div className="project-body">
        <ul className="project-points">
          {p.points.map((pt) => (
            <li key={pt}>{pt}</li>
          ))}
        </ul>
        <ul className="project-metrics" aria-label="Results">
          {p.metrics.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </div>

      <ul className="tags" aria-label="Tech stack">
        {p.stack.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </article>
  );
}
