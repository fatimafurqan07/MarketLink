import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './i18n/LanguageContext.tsx';
import { CountryProvider } from './i18n/CountryContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CountryProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </CountryProvider>
  </StrictMode>,
);
