import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { installAppLinks } from './lib/appLinks';
import { currentTheme } from './themes';

const IdeApp = lazy(() => import('./editor/IdeApp'));
const MidnightApp = lazy(() => import('./midnight/MidnightApp'));

const theme = currentTheme();
document.documentElement.dataset.theme = theme;
installAppLinks();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>{theme === 'midnight' ? <MidnightApp /> : <IdeApp />}</Suspense>
  </StrictMode>,
);
