import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { useScenarioStore } from './lib/store/scenarioStore';
import './index.css';

// Dev-only: expose the store for scripted run-throughs (`window.__ehs.getState()`).
if (import.meta.env.DEV) {
  (window as unknown as { __ehs: typeof useScenarioStore }).__ehs = useScenarioStore;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
