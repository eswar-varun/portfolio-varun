import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import IdeApp from './editor/IdeApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IdeApp />
  </StrictMode>,
);
