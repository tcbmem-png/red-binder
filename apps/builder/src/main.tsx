import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import './globals.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Root } from './Root';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

createRoot(root).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
