import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FirebaseProvider } from './context/FirebaseContext';
import { DecisionStoreProvider } from './context/DecisionStoreContext';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <FirebaseProvider>
        <DecisionStoreProvider>
          <App />
        </DecisionStoreProvider>
      </FirebaseProvider>
    </ThemeProvider>
  </StrictMode>,
);
