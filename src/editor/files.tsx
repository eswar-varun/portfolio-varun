import { Fragment, useState, type ReactNode } from 'react';
import { education, experience, otherProjects, profile, projects, skills, type Project } from '../data/profile';
import { copyEmail } from '../lib/browser';
import { describeEvent, isWithinDays, timeAgo, useGitHub } from '../lib/github';
import {
  Blank,
  Bold,
  Bullet,
  Code,
  Com,
  Dim,
  FileLink,
  Fn,
  H1,
  H2,
  InlineCode,
  Kw,
  Line,
  MdLink,
  Num,
  Prop,
  Str,
  Type,
} from './syntax';

export type Lang = 'Markdown' | 'TypeScript' | 'JSON' | 'Log' | 'Shell Script';

export type FileDef = {
  path: string;
  name: string;
  folder?: string;
  lang: Lang;
  render: () => ReactNode;
};

const readme: FileDef = {
  path: 'README.md',
  name: 'README.md',
  lang: 'Markdown',
  render: () => (
    <Code>
      <H1>{profile.name}</H1>
      <Line>
        <Bold>{profile.role}</Bold> at {profile.company} · {profile.location}
      </Line>
      <Line>
        <InlineCode>status: {profile.status}</InlineCode>
      </Line>
      <Blank />
      <Line className="md-lede">{profile.headline}</Line>
      <Blank />
      <Line>{profile.intro}</Line>
      <Blank />
      <H2>Projects</H2>
      {projects.map((p) => (
        <Bullet key={p.slug}>
          <FileLink path={`projects/${p.slug}.md`}>{p.title}</FileLink> <Dim>· {p.kind}</Dim>
        </Bullet>
      ))}
      <Blank />
      <H2>Links</H2>
      <Bullet>
        <MdLink href={profile.links.resume}>resume.pdf</MdLink>
      </Bullet>
      <Bullet>
        <MdLink href={profile.links.github}>github.com/{profile.githubUser}</MdLink>
      </Bullet>
      <Bullet>
        <MdLink href={profile.links.linkedin}>linkedin</MdLink>
      </Bullet>
      <Bullet>
        <MdLink href={`mailto:${profile.email}`}>{profile.email}</MdLink>
      </Bullet>
      {profile.sourceRepo && (
        <Bullet>
          <MdLink href={profile.sourceRepo}>source of this site</MdLink>
        </Bullet>
      )}
      <Blank />
      <Line>
        <Com>{'<!-- Open a file on the left, or type `help` in the terminal. -->'}</Com>
      </Line>
      <Line>
        <Com>{'<!-- Not into editors? Type `theme poster`, or use the theme menu in the status bar. -->'}</Com>
      </Line>
    </Code>
  ),
};

function projectFile(p: Project): FileDef {
  return {
    path: `projects/${p.slug}.md`,
    name: `${p.slug}.md`,
    folder: 'projects',
    lang: 'Markdown',
    render: () => (
      <Code>
        <H1>{p.title}</H1>
        <Line>
          <InlineCode>{p.kind}</InlineCode> <InlineCode>{p.year}</InlineCode>
          {p.private && <Dim> (internal, code is private)</Dim>}
        </Line>
        <Blank />
        <Line className="md-lede">{p.summary}</Line>
        <Blank />
        <H2>Pipeline</H2>
        <Line>
          {p.flow.map((step, i) => (
            <Fragment key={step}>
              {i > 0 && <span className="t-kw"> → </span>}
              <span className="t-type">{step}</span>
            </Fragment>
          ))}
        </Line>
        <Blank />
        <H2>What I built</H2>
        {p.points.map((pt) => (
          <Bullet key={pt}>{pt}</Bullet>
        ))}
        <Blank />
        <H2>Results</H2>
        {p.metrics.map((m) => (
          <Bullet key={m}>
            <Bold>{m}</Bold>
          </Bullet>
        ))}
        <Blank />
        <H2>Stack</H2>
        <Line>
          {p.stack.map((s, i) => (
            <Fragment key={s}>
              {i > 0 && ' '}
              <InlineCode>{s}</InlineCode>
            </Fragment>
          ))}
        </Line>
        {(p.repo || p.demo) && (
          <>
            <Blank />
            {p.repo && (
              <Line>
                <MdLink href={`${profile.links.github}/${p.repo}`}>View the code on GitHub</MdLink>
              </Line>
            )}
            {p.demo && (
              <Line>
                <MdLink href={p.demo}>Live demo</MdLink>
              </Line>
            )}
          </>
        )}
      </Code>
    ),
  };
}

const otherFiles: FileDef[] = otherProjects.map((o) => {
  const slug = o.slug;
  return {
    path: `projects/${slug}.md`,
    name: `${slug}.md`,
    folder: 'projects',
    lang: 'Markdown',
    render: () => (
      <Code>
        <H1>{o.title}</H1>
        <Line>
          <InlineCode>Personal</InlineCode>
        </Line>
        <Blank />
        <Line className="md-lede">{o.summary}</Line>
        <Blank />
        <H2>Stack</H2>
        <Line>
          {o.stack.map((s, i) => (
            <Fragment key={s}>
              {i > 0 && ' '}
              <InlineCode>{s}</InlineCode>
            </Fragment>
          ))}
        </Line>
        <Blank />
        <Line>
          <MdLink href={`${profile.links.github}/${o.repo}`}>View the code on GitHub</MdLink>
        </Line>
      </Code>
    ),
  };
});

/** `"a", "b", "c"` on one wrapped line. */
function StrList({ items }: { items: string[] }) {
  return (
    <>
      {items.map((s, i) => (
        <Fragment key={s}>
          {i > 0 && ', '}
          <Str>{s}</Str>
        </Fragment>
      ))}
    </>
  );
}

const experienceFile: FileDef = {
  path: 'experience.ts',
  name: 'experience.ts',
  lang: 'TypeScript',
  render: () => (
    <Code>
      <Line>
        <Com>// Work history, most recent first.</Com>
      </Line>
      <Line>
        <Kw>export const</Kw> <Prop>experience</Prop>: <Type>Role</Type>[] = [
      </Line>
      {experience.map((job) => (
        <Fragment key={job.company}>
          <Line indent={1}>{'{'}</Line>
          <Line indent={2}>
            <Prop>role</Prop>: <Str>{job.role}</Str>,
          </Line>
          <Line indent={2}>
            <Prop>company</Prop>: <Str>{job.company}</Str>,
          </Line>
          <Line indent={2}>
            <Prop>period</Prop>: <Str>{job.period}</Str>,
          </Line>
          <Line indent={2}>
            <Prop>location</Prop>: <Str>{job.location}</Str>,
          </Line>
          <Line indent={2}>
            <Prop>shipped</Prop>: [
          </Line>
          {job.points.map((pt) => (
            <Line key={pt} indent={3} hang={1}>
              <Str>{pt}</Str>,
            </Line>
          ))}
          <Line indent={2}>],</Line>
          <Line indent={2} hang={2}>
            <Prop>stack</Prop>: [<StrList items={job.stack} />],
          </Line>
          <Line indent={1}>{'},'}</Line>
        </Fragment>
      ))}
      <Line>];</Line>
      <Blank />
      <Line>
        <Kw>export const</Kw> <Prop>education</Prop> = {'{'}
      </Line>
      <Line indent={1}>
        <Prop>degree</Prop>: <Str>{education.degree}</Str>,
      </Line>
      <Line indent={1}>
        <Prop>school</Prop>: <Str>{education.school}</Str>,
      </Line>
      <Line indent={1}>
        <Prop>period</Prop>: <Str>{education.period}</Str>,
      </Line>
      <Line indent={1}>
        <Prop>cgpa</Prop>: <Num>8.53</Num>,
      </Line>
      <Line indent={1} hang={2}>
        <Prop>certifications</Prop>: [<StrList items={education.certs} />],
      </Line>
      <Line>{'};'}</Line>
    </Code>
  ),
};

const skillsFile: FileDef = {
  path: 'skills.json',
  name: 'skills.json',
  lang: 'JSON',
  render: () => (
    <Code>
      <Line>{'{'}</Line>
      {skills.map((g, i) => (
        <Line key={g.group} indent={1} hang={2}>
          <span className="t-prop">"{g.group}"</span>: [<StrList items={g.items} />]{i < skills.length - 1 ? ',' : ''}
        </Line>
      ))}
      <Line>{'}'}</Line>
    </Code>
  ),
};

function GitHubLog() {
  const gh = useGitHub(profile.githubUser);

  if (gh.status === 'loading') {
    return (
      <Code>
        <Line>
          <span className="t-fn">$</span> gh api users/{profile.githubUser}
        </Line>
        <Line>
          <Dim>fetching…</Dim>
        </Line>
      </Code>
    );
  }
  if (gh.status === 'error') {
    return (
      <Code>
        <Line>
          <span className="t-fn">$</span> gh api users/{profile.githubUser}
        </Line>
        <Line>
          <span className="t-kw">error</span>: GitHub didn't answer. <MdLink href={profile.links.github}>Open my profile</MdLink>
        </Line>
      </Code>
    );
  }

  const { user, repos, events, languages } = gh.data;
  const total = languages.reduce((s, l) => s + l.bytes, 0) || 1;
  const feed = events
    .map((e) => ({ e, text: describeEvent(e, user.login) }))
    .filter((x): x is { e: typeof x.e; text: string } => !!x.text)
    .slice(0, 8);

  return (
    <Code>
      <Line>
        <Com># Live from the GitHub API, cached for 30 minutes.</Com>
      </Line>
      <Line>
        <span className="t-fn">$</span> gh api users/{user.login}
      </Line>
      <Line>
        <Prop>{'user'.padEnd(10)}</Prop>
        <MdLink href={user.html_url}>{user.login}</MdLink>
      </Line>
      <Line>
        <Prop>{'repos'.padEnd(10)}</Prop>
        <Num>{user.public_repos}</Num>
      </Line>
      <Line>
        <Prop>{'since'.padEnd(10)}</Prop>
        <Num>{new Date(user.created_at).getFullYear()}</Num>
      </Line>
      {languages.slice(0, 5).map((l, i) => {
        const pct = Math.round((l.bytes / total) * 100);
        return (
          <Line key={l.name}>
            <Prop>{(i === 0 ? 'languages' : '').padEnd(10)}</Prop>
            <span className="t-type">{l.name.padEnd(18)}</span>
            <span className="bar">{'█'.repeat(Math.max(1, Math.round(pct / 5)))}</span> <Dim>{pct}%</Dim>
          </Line>
        );
      })}
      <Blank />
      <Line>
        <span className="t-fn">$</span> gh repo list {user.login}
      </Line>
      {repos.slice(0, 8).map((r) => (
        <Line key={r.name} hang={4}>
          <MdLink href={r.html_url}>{r.name}</MdLink>
          {r.language && <span className="t-type"> {r.language}</span>}
          {isWithinDays(r.pushed_at, 180) && <Dim> · updated {timeAgo(r.pushed_at)}</Dim>}
          {r.description && <Dim> · {r.description}</Dim>}
        </Line>
      ))}
      {feed.length > 0 && (
        <>
          <Blank />
          <Line>
            <span className="t-fn">$</span> gh activity --recent
          </Line>
          {feed.map(({ e, text }) => (
            <Line key={e.id} hang={2}>
              <span className="t-kw">* </span>
              {text} <Dim>({timeAgo(e.created_at)})</Dim>
            </Line>
          ))}
        </>
      )}
    </Code>
  );
}

const githubFile: FileDef = {
  path: 'github.log',
  name: 'github.log',
  lang: 'Log',
  render: () => <GitHubLog />,
};

function ContactScript() {
  const [copied, setCopied] = useState(false);
  return (
    <Code>
      <Line>
        <Com>#!/usr/bin/env bash</Com>
      </Line>
      <Line>
        <Com># Email is the fastest way to reach me.</Com>
      </Line>
      <Blank />
      <Line>
        <Prop>EMAIL</Prop>=<Str>{profile.email}</Str>{' '}
        <button
          type="button"
          className="inline-btn"
          onClick={async () => {
            if (await copyEmail()) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }
          }}
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </Line>
      <Line>
        <Prop>LINKEDIN</Prop>=<Str>{profile.links.linkedin}</Str>
      </Line>
      <Line>
        <Prop>GITHUB</Prop>=<Str>{profile.links.github}</Str>
      </Line>
      <Line>
        <Prop>RESUME</Prop>=<Str>{profile.links.resume}</Str>
      </Line>
      <Line>
        <Prop>LOCATION</Prop>=<Str>{profile.location}</Str>
      </Line>
      <Blank />
      <Line>
        <Fn>open</Fn> <Str>mailto:$EMAIL</Str>{' '}
        <a className="inline-btn run" href={`mailto:${profile.email}`}>
          ▶ run
        </a>
      </Line>
      <Line>
        <Fn>open</Fn> <Str>$RESUME</Str>{' '}
        <a className="inline-btn run" href={profile.links.resume} target="_blank" rel="noreferrer">
          ▶ run
        </a>
      </Line>
    </Code>
  );
}

const contactFile: FileDef = {
  path: 'contact.sh',
  name: 'contact.sh',
  lang: 'Shell Script',
  render: () => <ContactScript />,
};

export const FILES: FileDef[] = [
  readme,
  ...projects.map(projectFile),
  ...otherFiles,
  experienceFile,
  skillsFile,
  githubFile,
  contactFile,
];

export const FILE_BY_PATH = new Map(FILES.map((f) => [f.path, f]));

export function fileBadge(f: FileDef): { text: string; cls: string } {
  switch (f.lang) {
    case 'Markdown':
      return { text: 'M↓', cls: 'fi-md' };
    case 'TypeScript':
      return { text: 'TS', cls: 'fi-ts' };
    case 'JSON':
      return { text: '{}', cls: 'fi-json' };
    case 'Log':
      return { text: '≡', cls: 'fi-log' };
    case 'Shell Script':
      return { text: '$', cls: 'fi-sh' };
  }
}
