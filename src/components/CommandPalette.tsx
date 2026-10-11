import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { profile } from '../data/profile';
import { copyEmail } from './CopyEmail';
import { ArrowRight, Copy, FileText, GitHub, LinkedIn, Mail, Moon, Search } from './Icons';
import { NAV } from './Header';

type Command = { id: string; label: string; hint: string; icon: ReactNode; run: () => void };

type Props = { open: boolean; onClose: () => void; onToggleTheme: () => void };

export function CommandPalette({ open, onClose, onToggleTheme }: Props) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef<Element | null>(null);

  const commands = useMemo<Command[]>(() => {
    const go = (id: string) => () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    const open = (url: string) => () => window.open(url, '_blank', 'noopener');
    return [
      ...NAV.map((n) => ({ id: n.id, label: `Go to ${n.label}`, hint: 'Section', icon: <ArrowRight width={16} height={16} />, run: go(n.id) })),
      { id: 'resume', label: 'Open resume', hint: 'PDF', icon: <FileText width={16} height={16} />, run: open(profile.links.resume) },
      {
        id: 'copy',
        label: 'Copy email address',
        hint: profile.email,
        icon: <Copy width={16} height={16} />,
        run: () => void copyEmail().then((ok) => setToast(ok ? 'Email copied' : null)),
      },
      { id: 'mail', label: 'Send an email', hint: 'mailto', icon: <Mail width={16} height={16} />, run: () => (window.location.href = `mailto:${profile.email}`) },
      { id: 'gh', label: 'GitHub profile', hint: `@${profile.githubUser}`, icon: <GitHub width={16} height={16} />, run: open(profile.links.github) },
      { id: 'li', label: 'LinkedIn profile', hint: 'LinkedIn', icon: <LinkedIn width={16} height={16} />, run: open(profile.links.linkedin) },
      { id: 'theme', label: 'Toggle light / dark theme', hint: 'Theme', icon: <Moon width={16} height={16} />, run: onToggleTheme },
    ];
  }, [onToggleTheme]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? commands.filter((c) => `${c.label} ${c.hint}`.toLowerCase().includes(q)) : commands;
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      restoreFocus.current = document.activeElement;
      setQuery('');
      setIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (restoreFocus.current instanceof HTMLElement) {
      restoreFocus.current.focus();
    }
  }, [open]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const run = (c: Command | undefined) => {
    if (!c) return;
    onClose();
    c.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => (i + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => (i - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(results[index]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      e.preventDefault(); // keep focus inside the dialog
    }
  };

  return (
    <>
      {open && (
        <div className="palette-backdrop" onMouseDown={onClose}>
          <div
            className="palette"
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <div className="palette-search">
              <Search width={16} height={16} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search…"
                aria-label="Search commands"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={results[index] ? `cmd-${results[index].id}` : undefined}
              />
              <kbd>Esc</kbd>
            </div>
            <ul className="palette-list" id="palette-list" role="listbox">
              {results.length === 0 && <li className="palette-empty">No matches.</li>}
              {results.map((c, i) => (
                <li
                  key={c.id}
                  id={`cmd-${c.id}`}
                  role="option"
                  aria-selected={i === index}
                  className={i === index ? 'is-selected' : undefined}
                  onMouseMove={() => setIndex(i)}
                  onClick={() => run(c)}
                >
                  <span className="palette-icon">{c.icon}</span>
                  <span className="palette-label">{c.label}</span>
                  <span className="palette-hint">{c.hint}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
