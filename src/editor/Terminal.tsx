import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from 'react';
import { profile } from '../data/profile';
import { openExternal } from '../lib/appLinks';
import { copyEmail } from '../lib/browser';
import { THEMES, switchTheme, type ThemeId } from '../themes';
import { FILES } from './files';

type Entry = { id: number; cmd?: string; out: ReactNode };

export type TerminalHandle = { focus: (prefill?: string) => void };

type Props = { onOpenFile: (path: string) => void; onClose: () => void };

const PROMPT = `${profile.githubUser}@portfolio`;

const HELP: [string, string][] = [
  ['<file name>', 'open a file, e.g. skills, experience, contact'],
  ['projects', 'list my projects'],
  ['ls [dir]', 'list files'],
  ['open <file>', 'open a file in the editor (Tab completes)'],
  ['whoami', 'who I am, in one line'],
  ['resume', 'open my resume (PDF)'],
  ['email', 'copy my email address'],
  ['github', 'open my GitHub'],
  ['linkedin', 'open my LinkedIn'],
  ['theme [name]', `switch theme (${THEMES.map((t) => t.id).join(', ')})`],
  ['clear', 'clear the terminal'],
  ['exit', 'close this panel'],
];

let nextId = 0;

// Words people type that mean a file without naming it.
const ALIASES: Record<string, string> = {
  about: 'README.md',
  me: 'README.md',
  home: 'README.md',
  readme: 'README.md',
  work: 'experience.ts',
  jobs: 'experience.ts',
  education: 'experience.ts',
  stack: 'skills.json',
  activity: 'github.log',
  hire: 'contact.sh',
  'hire me': 'contact.sh',
};

const PROJECT_FILES = FILES.filter((f) => f.folder === 'projects');

/** Forgiving lookup: exact path or name, name without extension, alias, then a unique prefix or substring. */
function resolveFile(input: string) {
  const q = input
    .trim()
    .toLowerCase()
    .replace(/^(\.\/|~\/)/, '')
    .replace(/\/$/, '');
  if (!q) return undefined;
  const base = (name: string) => name.toLowerCase().replace(/\.[^.]+$/, '');
  const exact = FILES.find((f) => f.path.toLowerCase() === q || f.name.toLowerCase() === q || base(f.name) === q);
  if (exact) return exact;
  if (ALIASES[q]) return FILES.find((f) => f.path === ALIASES[q]);
  const prefix = FILES.filter((f) => f.name.toLowerCase().startsWith(q) || f.path.toLowerCase().startsWith(q));
  if (prefix.length === 1) return prefix[0];
  const inside = FILES.filter((f) => f.path.toLowerCase().includes(q));
  return inside.length === 1 ? inside[0] : undefined;
}

/** Closest command or file name, for "did you mean". */
function suggest(input: string): string | undefined {
  const words = [
    ...HELP.map(([c]) => c.split(' ')[0]).filter((c) => !c.startsWith('<')),
    ...FILES.map((f) => f.name.replace(/\.[^.]+$/, '')),
  ];
  let best: string | undefined;
  let bestScore = Infinity;
  for (const w of words) {
    const d = distance(input.toLowerCase(), w.toLowerCase());
    if (d < bestScore) {
      bestScore = d;
      best = w;
    }
  }
  return bestScore <= Math.max(2, Math.floor(input.length / 3)) ? best : undefined;
}

function distance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

function FileList({ files, onOpen }: { files: typeof FILES; onOpen: (path: string) => void }) {
  return (
    <div className="term-ls">
      {files.map((f) => (
        <button key={f.path} type="button" className="term-file" onClick={() => onOpen(f.path)}>
          {f.path}
        </button>
      ))}
    </div>
  );
}

function Whoami() {
  return (
    <span>
      {profile.name}, {profile.role.toLowerCase()} at {profile.company} in {profile.location}.{' '}
      <span className="t-str">{profile.status}.</span>
    </span>
  );
}

export const Terminal = forwardRef<TerminalHandle, Props>(function Terminal({ onOpenFile, onClose }, ref) {
  const [entries, setEntries] = useState<Entry[]>(() => [
    { id: nextId++, cmd: 'whoami', out: <Whoami /> },
    { id: nextId++, out: <span className="t-dim">Type <b className="t-fn">help</b> to see what you can do here.</span> },
  ]);
  const [value, setValue] = useState('');
  const history = useRef<string[]>([]);
  const historyIdx = useRef(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    focus(prefill) {
      if (prefill !== undefined) setValue(prefill);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
  }));

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries]);

  const print = (cmd: string, out: ReactNode) => setEntries((e) => [...e, { id: nextId++, cmd, out }]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (cmd) {
      history.current.unshift(cmd);
      historyIdx.current = -1;
    }
    const [name, ...args] = cmd.split(/\s+/);
    const arg = args.join(' ');

    switch (name) {
      case '':
        print(cmd, null);
        break;
      case 'help':
        print(
          cmd,
          <div className="term-table">
            {HELP.map(([c, d]) => (
              <div key={c}>
                <span className="t-fn">{c.padEnd(14)}</span>
                <span className="t-dim">{d}</span>
              </div>
            ))}
          </div>,
        );
        break;
      case 'ls':
      case 'dir':
      case 'll': {
        const dir = args.filter((a) => !a.startsWith('-')).join(' ').replace(/\/$/, '');
        print(cmd, <FileList files={dir === 'projects' ? PROJECT_FILES : FILES} onOpen={onOpenFile} />);
        break;
      }
      case 'cd':
        if (arg.replace(/\/$/, '') === 'projects') {
          print(cmd, <FileList files={PROJECT_FILES} onOpen={onOpenFile} />);
        } else {
          print(cmd, arg && arg !== '~' && arg !== '..' ? <span className="t-kw">no such directory: {arg}. Try ls.</span> : null);
        }
        break;
      case 'projects':
        print(cmd, <FileList files={PROJECT_FILES} onOpen={onOpenFile} />);
        break;
      case 'pwd':
        print(cmd, <span>/home/{profile.githubUser}/portfolio</span>);
        break;
      case 'echo':
        print(cmd, <span>{arg}</span>);
        break;
      case 'open':
      case 'cat':
      case 'code':
      case 'less':
      case 'more':
      case 'vim':
      case 'vi':
      case 'nano':
      case 'bash':
      case 'sh': {
        const match = resolveFile(arg);
        if (match) {
          onOpenFile(match.path);
          print(cmd, <span className="t-dim">opened {match.path}</span>);
        } else {
          print(cmd, <span className="t-kw">{arg ? `no such file: ${arg}` : `usage: ${name} <file>`}. Try ls.</span>);
        }
        break;
      }
      case 'whoami':
        print(cmd, <Whoami />);
        break;
      case 'resume':
        window.open(profile.links.resume, '_blank', 'noopener');
        print(cmd, <span className="t-dim">opening resume.pdf…</span>);
        break;
      case 'email':
        void copyEmail().then((ok) =>
          print(cmd, ok ? <span>copied <span className="t-str">{profile.email}</span></span> : <span>{profile.email}</span>),
        );
        break;
      case 'github':
      case 'linkedin':
        openExternal(profile.links[name]);
        print(cmd, <span className="t-dim">opening {name}…</span>);
        break;
      case 'theme': {
        const target = THEMES.find((t) => t.id === arg);
        if (target && target.id !== 'ide') {
          print(cmd, <span className="t-dim">switching to {target.label.toLowerCase()} theme…</span>);
          setTimeout(() => switchTheme(target.id as ThemeId), 250);
        } else if (target) {
          print(cmd, <span className="t-dim">already using the editor theme.</span>);
        } else {
          print(
            cmd,
            <span>
              themes: {THEMES.map((t) => (t.id === 'ide' ? `${t.id} (current)` : t.id)).join(', ')}.{' '}
              <span className="t-dim">Try theme cinema.</span>
            </span>,
          );
        }
        break;
      }
      case 'clear':
        setEntries([]);
        break;
      case 'exit':
        onClose();
        break;
      case 'sudo':
        print(cmd, <span className="t-kw">nice try. Hire me first.</span>);
        break;
      default: {
        // Typing a file name (or ./contact.sh) just opens it.
        const match = resolveFile(cmd);
        if (match) {
          onOpenFile(match.path);
          print(cmd, <span className="t-dim">opened {match.path}</span>);
          break;
        }
        const guess = suggest(name);
        print(
          cmd,
          <span>
            <span className="t-kw">command not found: {name}.</span>{' '}
            {guess ? (
              <span className="t-dim">
                Did you mean <b className="t-fn">{guess}</b>?
              </span>
            ) : (
              <span className="t-dim">
                Try <b className="t-fn">help</b>, or type a file name like <b className="t-fn">skills</b>.
              </span>
            )}
          </span>,
        );
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(value);
      setValue('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const i = Math.min(historyIdx.current + 1, history.current.length - 1);
      if (i >= 0) {
        historyIdx.current = i;
        setValue(history.current[i]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const i = historyIdx.current - 1;
      historyIdx.current = Math.max(i, -1);
      setValue(i >= 0 ? history.current[i] : '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const tm = value.match(/^theme\s+(.*)$/);
      const m = value.match(/^(open|cat|code)\s+(.*)$/);
      if (tm) {
        const hit = THEMES.filter((th) => th.id.startsWith(tm[1]));
        if (hit.length === 1) setValue(`theme ${hit[0].id}`);
      } else if (m) {
        const hits = FILES.filter((f) => f.path.startsWith(m[2]) || f.name.startsWith(m[2]));
        if (hits.length === 1) setValue(`${m[1]} ${hits[0].path}`);
        else if (hits.length > 1) print(value, <span className="t-dim">{hits.map((h) => h.path).join('   ')}</span>);
      } else {
        const cmds = HELP.map(([c]) => c.split(' ')[0]).filter((c) => !c.startsWith('<') && c.startsWith(value));
        const files = value ? FILES.filter((f) => f.name.toLowerCase().startsWith(value.toLowerCase())) : [];
        if (cmds.length === 1 && files.length === 0) setValue(cmds[0] + (cmds[0] === 'open' || cmds[0] === 'theme' ? ' ' : ''));
        else if (files.length === 1 && cmds.length === 0) setValue(files[0].name);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  };

  return (
    <div className="term" onClick={() => inputRef.current?.focus()}>
      <div className="term-scroll" ref={scrollRef}>
        {entries.map((en) => (
          <div key={en.id} className="term-entry">
            {en.cmd !== undefined && (
              <div>
                <span className="term-prompt">{PROMPT}</span>
                <span className="t-dim">:~$ </span>
                {en.cmd}
              </div>
            )}
            {en.out && <div className="term-out">{en.out}</div>}
          </div>
        ))}
        <label className="term-input-row">
          <span className="term-prompt">{PROMPT}</span>
          <span className="t-dim">:~$&nbsp;</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Terminal input. Type help for commands."
          />
        </label>
      </div>
    </div>
  );
});
