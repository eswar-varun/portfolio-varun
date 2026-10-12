import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { installAppLinks } from './lib/appLinks';
import { currentTheme } from './themes';

const IdeApp = lazy(() => import('./editor/IdeApp'));
const CinemaApp = lazy(() => import('./cinema/CinemaApp'));

const theme = currentTheme();
document.documentElement.dataset.theme = theme;
installAppLinks();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>{theme === 'cinema' ? <CinemaApp /> : <IdeApp />}</Suspense>
  </StrictMode>,
);
