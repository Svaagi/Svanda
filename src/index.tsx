import 'assets/styles/index.css';
import 'i18n';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { BlobColorProvider } from 'context/BlobColorContext';
import { LavaLampProvider } from 'context/LavaLampContext';

import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <BlobColorProvider>
      <LavaLampProvider>
        <App />
      </LavaLampProvider>
    </BlobColorProvider>
  </StrictMode>,
);
