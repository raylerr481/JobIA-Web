import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app_v2';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
