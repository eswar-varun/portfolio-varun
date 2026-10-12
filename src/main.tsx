import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { installAppLinks } from './lib/appLinks';
import { currentTheme } from './themes';

const IdeApp = lazy(() => import('./editor/IdeApp'));
const AuroraApp = lazy(() => import('./aurora/AuroraApp'));

const theme = currentTheme();
document.documentElement.dataset.theme = theme;
installAppLinks();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>{theme === 'aurora' ? <AuroraApp /> : <IdeApp />}</Suspense>
  </StrictMode>,
);
