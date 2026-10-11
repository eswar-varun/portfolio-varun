import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from 'react';
import { profile } from '../data/profile';
import { copyEmail } from '../lib/browser';
import { THEMES, switchTheme, type ThemeId } from '../themes';
import { FILES } from './files';

type Entry = { id: number; cmd?: string; out: ReactNode };

export type TerminalHandle = { focus: (prefill?: string) => void };

type Props = { onOpenFile: (path: string) => void; onClose: () => void };

const PROMPT = `${profile.githubUser}@portfolio`;

const HELP: [string, string][] = [
  ['ls', 'list files'],
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
        print(
          cmd,
          <div className="term-ls">
            {FILES.map((f) => (
              <button key={f.path} type="button" className="term-file" onClick={() => onOpenFile(f.path)}>
                {f.path}
              </button>
            ))}
          </div>,
        );
        break;
      case 'open':
      case 'cat':
      case 'code': {
        const match = FILES.find((f) => f.path === arg || f.name === arg) ?? FILES.find((f) => f.path.startsWith(arg) && arg);
        if (match) {
          onOpenFile(match.path);
          print(cmd, <span className="t-dim">opened {match.path}</span>);
        } else {
          print(cmd, <span className="t-kw">{arg ? `no such file: ${arg}` : 'usage: open <file>'}. Try ls.</span>);
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
        window.open(profile.links[name], '_blank', 'noopener');
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
              <span className="t-dim">Try theme poster.</span>
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
      default:
        print(cmd, <span className="t-kw">command not found: {name}. Try help.</span>);
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
        const cmds = HELP.map(([c]) => c.split(' ')[0]).filter((c) => c.startsWith(value));
        if (cmds.length === 1) setValue(cmds[0] + (cmds[0] === 'open' || cmds[0] === 'theme' ? ' ' : ''));
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
