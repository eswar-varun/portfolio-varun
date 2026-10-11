import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';

// Two designs while choosing. `?design=ide` or `?design=poster` overrides
// the default; once one is picked, delete the other folder and this switch.
type Design = 'ide' | 'poster';
const DEFAULT_DESIGN: Design = 'ide';

const IdeApp = lazy(() => import('./designs/ide/IdeApp'));
const PosterApp = lazy(() => import('./designs/poster/PosterApp'));

const param = new URLSearchParams(window.location.search).get('design');
const design: Design = param === 'ide' || param === 'poster' ? param : DEFAULT_DESIGN;

function DesignSwitcher() {
  const other: Design = design === 'ide' ? 'poster' : 'ide';
  return (
    <a
      href={`?design=${other}`}
      style={{
        position: 'fixed',
        right: 12,
        bottom: 40,
        zIndex: 1000,
        padding: '8px 12px',
        borderRadius: 8,
        background: '#ff3d00',
        color: '#fff',
        font: '600 12px/1 system-ui, sans-serif',
        textDecoration: 'none',
        boxShadow: '0 6px 20px rgba(0,0,0,.35)',
      }}
    >
      Review: switch to {other} design
    </a>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>{design === 'ide' ? <IdeApp /> : <PosterApp />}</Suspense>
    {import.meta.env.DEV && <DesignSwitcher />}
  </StrictMode>,
);
