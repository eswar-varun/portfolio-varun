// Tiny "syntax highlighting" primitives. Files are written by hand as JSX
// lines, so there's no parser: each token says what it is.

import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';

type C = { children?: ReactNode };

export const Kw = ({ children }: C) => <span className="t-kw">{children}</span>;
export const Str = ({ children }: C) => <span className="t-str">"{children}"</span>;
export const Prop = ({ children }: C) => <span className="t-prop">{children}</span>;
export const Num = ({ children }: C) => <span className="t-num">{children}</span>;
export const Fn = ({ children }: C) => <span className="t-fn">{children}</span>;
export const Type = ({ children }: C) => <span className="t-type">{children}</span>;
export const Com = ({ children }: C) => <span className="t-com">{children}</span>;
export const Dim = ({ children }: C) => <span className="t-dim">{children}</span>;
export const InlineCode = ({ children }: C) => (
  <span className="t-code">
    <span className="t-dim">`</span>
    {children}
    <span className="t-dim">`</span>
  </span>
);
export const Bold = ({ children }: C) => (
  <>
    <span className="t-dim">**</span>
    <strong className="t-bold">{children}</strong>
    <span className="t-dim">**</span>
  </>
);

type LineProps = { children?: ReactNode; indent?: number; hang?: number; className?: string };

/** One numbered source line. `hang` keeps wrapped text aligned after a bullet. */
export function Line({ children, indent = 0, hang = 0, className }: LineProps) {
  return (
    <div className={`ln${className ? ` ${className}` : ''}`}>
      <span className="ln-text" style={{ '--indent': indent, '--hang': hang } as CSSProperties}>
        {children ?? '​'}
      </span>
    </div>
  );
}

export const Blank = () => <Line />;

export function Code({ children }: C) {
  return <div className="code">{children}</div>;
}

// Markdown helpers
export const H1 = ({ children }: C) => (
  <Line className="md-h1">
    <span className="t-dim"># </span>
    <span className="t-h1">{children}</span>
  </Line>
);

export const H2 = ({ children }: C) => (
  <Line className="md-h2">
    <span className="t-dim">## </span>
    <span className="t-h2">{children}</span>
  </Line>
);

export const Bullet = ({ children }: C) => (
  <Line hang={2}>
    <span className="t-bul">- </span>
    {children}
  </Line>
);

/** Markdown link that opens a real URL. */
export function MdLink({ href, children }: { href: string; children: ReactNode }) {
  const external = /^https?:/.test(href);
  return (
    <a className="md-link" href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      <span className="t-dim">[</span>
      <span className="t-link">{children}</span>
      <span className="t-dim">]</span>
    </a>
  );
}

// Lets file contents open other files in the editor.
export const OpenFileContext = createContext<(path: string) => void>(() => {});

export function FileLink({ path, children }: { path: string; children?: ReactNode }) {
  const open = useContext(OpenFileContext);
  return (
    <a
      className="md-link"
      href={`#${path}`}
      onClick={(e) => {
        e.preventDefault();
        open(path);
      }}
    >
      <span className="t-dim">[</span>
      <span className="t-link">{children ?? path}</span>
      <span className="t-dim">]</span>
    </a>
  );
}
