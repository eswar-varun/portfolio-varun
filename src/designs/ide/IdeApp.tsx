import { useCallback, useEffect, useRef, useState } from 'react';
import { profile } from '../../data/profile';
import { loadStylesheet } from '../../lib/browser';
import { GitHub, LinkedIn } from '../../components/Icons';
import { FILES, FILE_BY_PATH, fileBadge, type FileDef } from './files';
import { OpenFileContext } from './syntax';
import { Terminal, type TerminalHandle } from './Terminal';
import './ide.css';

loadStylesheet('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap');

const DEFAULT_FILE = 'README.md';
const MOBILE = '(max-width: 820px)';

function pathFromHash(): string | null {
  const p = decodeURIComponent(window.location.hash.slice(1));
  return FILE_BY_PATH.has(p) ? p : null;
}

export default function IdeApp() {
  const isMobile = () => window.matchMedia(MOBILE).matches;
  const initial = pathFromHash() ?? DEFAULT_FILE;
  const [tabs, setTabs] = useState<string[]>(() => (initial === DEFAULT_FILE ? [DEFAULT_FILE] : [DEFAULT_FILE, initial]));
  const [active, setActive] = useState<string | null>(initial);
  const [sidebarOpen, setSidebarOpen] = useState(() => !isMobile());
  const [terminalOpen, setTerminalOpen] = useState(() => !isMobile());
  const [projectsOpen, setProjectsOpen] = useState(true);
  const terminal = useRef<TerminalHandle>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const open = useCallback((path: string) => {
    if (!FILE_BY_PATH.has(path)) return;
    setTabs((t) => (t.includes(path) ? t : [...t, path]));
    setActive(path);
    if (window.matchMedia(MOBILE).matches) setSidebarOpen(false);
  }, []);

  const close = (path: string) => {
    const i = tabs.indexOf(path);
    const next = tabs.filter((p) => p !== path);
    setTabs(next);
    if (active === path) setActive(next[Math.min(i, next.length - 1)] ?? null);
  };

  // Keep the URL in sync so a file can be linked directly.
  useEffect(() => {
    const target = active ?? '';
    if (decodeURIComponent(window.location.hash.slice(1)) !== target) {
      history.replaceState(null, '', target ? `#${target}` : window.location.pathname + window.location.search);
    }
    editorRef.current?.scrollTo({ top: 0 });
    document.title = active ? `${FILE_BY_PATH.get(active)!.name} · ${profile.name}` : `${profile.name}, Software Engineer`;
  }, [active]);

  useEffect(() => {
    const onHash = () => {
      const p = pathFromHash();
      if (p) open(p);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [open]);

  // Editor shortcuts: Ctrl+` terminal, Ctrl+B sidebar, Ctrl+P quick open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === '`') {
        e.preventDefault();
        setTerminalOpen((o) => !o);
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarOpen((o) => !o);
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setTerminalOpen(true);
        setTimeout(() => terminal.current?.focus('open '), 0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const activeFile = active ? FILE_BY_PATH.get(active) : undefined;
  const rootFiles = FILES.filter((f) => !f.folder);
  const projectFiles = FILES.filter((f) => f.folder === 'projects');

  return (
    <OpenFileContext.Provider value={open}>
      <div className={`ide${sidebarOpen ? ' sidebar-open' : ''}${terminalOpen ? ' terminal-open' : ''}`}>
        {/* Title bar */}
        <header className="titlebar">
          <div className="lights" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <button
            type="button"
            className="tb-menu"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={sidebarOpen ? 'Hide files' : 'Show files'}
            aria-expanded={sidebarOpen}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <div className="tb-title">
            <b>{profile.name}</b>
            <span className="t-dim"> · software engineer</span>
          </div>
          <nav className="tb-actions" aria-label="Quick links">
            <a href={profile.links.github} target="_blank" rel="noreferrer" className="tb-icon" aria-label="GitHub">
              <GitHub width={15} height={15} />
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="tb-icon" aria-label="LinkedIn">
              <LinkedIn width={15} height={15} />
            </a>
            <a href={`mailto:${profile.email}`} className="tb-btn">
              Email
            </a>
            <a href={profile.links.resume} target="_blank" rel="noreferrer" className="tb-btn tb-btn-primary">
              Resume
            </a>
          </nav>
        </header>

        <div className="workbench">
          {/* Activity bar */}
          <nav className="activity" aria-label="Views">
            <button
              type="button"
              className={sidebarOpen ? 'is-active' : undefined}
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Explorer (Ctrl+B)"
              title="Explorer (Ctrl+B)"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
              </svg>
            </button>
            <button type="button" onClick={() => open('github.log')} aria-label="GitHub activity" title="GitHub activity">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <circle cx="6" cy="6" r="2.5" />
                <circle cx="6" cy="18" r="2.5" />
                <circle cx="18" cy="8" r="2.5" />
                <path d="M6 8.5v7M18 10.5c0 4-6 3-11 5.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                setTerminalOpen(true);
                setTimeout(() => terminal.current?.focus(), 0);
              }}
              aria-label="Terminal (Ctrl+`)"
              title="Terminal (Ctrl+`)"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="m7 9 3 3-3 3M13 15h4" />
              </svg>
            </button>
            <button type="button" onClick={() => open('contact.sh')} aria-label="Contact" title="Contact">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </button>
          </nav>

          {/* Explorer */}
          <aside className="sidebar" aria-label="Files">
            <div className="sidebar-title">Explorer</div>
            <div className="tree-root">{profile.handle}</div>
            <ul className="tree" role="tree">
              <TreeItem file={rootFiles[0]} active={active} onOpen={open} depth={0} />
              <li role="treeitem" aria-expanded={projectsOpen}>
                <button type="button" className="tree-row" style={{ paddingLeft: 12 }} onClick={() => setProjectsOpen((o) => !o)}>
                  <span className={`chev${projectsOpen ? ' open' : ''}`} aria-hidden>
                    ›
                  </span>
                  projects
                </button>
                {projectsOpen && (
                  <ul role="group">
                    {projectFiles.map((f) => (
                      <TreeItem key={f.path} file={f} active={active} onOpen={open} depth={1} />
                    ))}
                  </ul>
                )}
              </li>
              {rootFiles.slice(1).map((f) => (
                <TreeItem key={f.path} file={f} active={active} onOpen={open} depth={0} />
              ))}
            </ul>
            <div className="sidebar-foot">
              <div className="t-dim">Tip</div>
              <div>
                Press <kbd>Ctrl</kbd> <kbd>P</kbd> to open a file, or type <b>help</b> in the terminal.
              </div>
            </div>
          </aside>
          <button type="button" className="scrim" aria-label="Close files" onClick={() => setSidebarOpen(false)} />

          {/* Editor */}
          <section className="editor-col" aria-label="Editor">
            <div className="tabs" role="tablist">
              {tabs.map((p) => {
                const f = FILE_BY_PATH.get(p)!;
                const b = fileBadge(f);
                return (
                  <div key={p} className={`tab${p === active ? ' is-active' : ''}`} role="presentation">
                    <button type="button" role="tab" aria-selected={p === active} className="tab-main" onClick={() => setActive(p)}>
                      <span className={`fi ${b.cls}`}>{b.text}</span>
                      {f.name}
                    </button>
                    <button type="button" className="tab-close" onClick={() => close(p)} aria-label={`Close ${f.name}`}>
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            {activeFile ? (
              <>
                <div className="crumbs">
                  {profile.handle}
                  {activeFile.path.split('/').map((seg) => (
                    <span key={seg}>
                      <span className="t-dim"> › </span>
                      {seg}
                    </span>
                  ))}
                </div>
                <div className="editor" ref={editorRef} role="tabpanel" aria-label={activeFile.name}>
                  <div className="editor-inner" key={activeFile.path}>
                    {activeFile.render()}
                  </div>
                </div>
              </>
            ) : (
              <Welcome onOpen={open} />
            )}

            {terminalOpen && (
              <div className="panel">
                <div className="panel-head">
                  <span className="panel-tab is-active">Terminal</span>
                  <span className="panel-tab">Problems <span className="badge">0</span></span>
                  <button type="button" className="panel-close" onClick={() => setTerminalOpen(false)} aria-label="Close terminal">
                    ×
                  </button>
                </div>
                <Terminal ref={terminal} onOpenFile={open} onClose={() => setTerminalOpen(false)} />
              </div>
            )}
          </section>
        </div>

        {/* Status bar */}
        <footer className="statusbar">
          <span className="sb-item">⎇ main</span>
          <span className="sb-item sb-status">● {profile.status}</span>
          <span className="sb-spacer" />
          <span className="sb-item sb-hide-sm">{profile.location}</span>
          {activeFile && <span className="sb-item sb-hide-sm">{activeFile.lang}</span>}
          <span className="sb-item sb-hide-sm">UTF-8</span>
          <button type="button" className="sb-item sb-btn" onClick={() => setTerminalOpen((o) => !o)}>
            {terminalOpen ? 'Hide terminal' : 'Terminal'}
          </button>
        </footer>
      </div>
    </OpenFileContext.Provider>
  );
}

function TreeItem({ file, active, onOpen, depth }: { file: FileDef; active: string | null; onOpen: (p: string) => void; depth: number }) {
  const b = fileBadge(file);
  return (
    <li role="treeitem" aria-selected={active === file.path}>
      <button
        type="button"
        className={`tree-row${active === file.path ? ' is-active' : ''}`}
        style={{ paddingLeft: 12 + depth * 14 + 12 }}
        onClick={() => onOpen(file.path)}
      >
        <span className={`fi ${b.cls}`}>{b.text}</span>
        {file.name}
      </button>
    </li>
  );
}

function Welcome({ onOpen }: { onOpen: (p: string) => void }) {
  return (
    <div className="welcome">
      <div className="welcome-mark">EV</div>
      <p className="t-dim">No file open.</p>
      <ul>
        <li>
          <button type="button" onClick={() => onOpen('README.md')}>
            Open README.md
          </button>
        </li>
        <li>
          <span className="t-dim">Toggle terminal</span> <kbd>Ctrl</kbd> <kbd>`</kbd>
        </li>
        <li>
          <span className="t-dim">Toggle files</span> <kbd>Ctrl</kbd> <kbd>B</kbd>
        </li>
      </ul>
    </div>
  );
}
