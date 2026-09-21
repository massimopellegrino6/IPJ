import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DecisionStoreProvider } from './context/DecisionStoreContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DecisionStoreProvider>
      <App />
    </DecisionStoreProvider>
  </StrictMode>,
);

