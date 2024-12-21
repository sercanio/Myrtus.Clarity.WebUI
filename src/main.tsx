import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from '@services/msalService';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <MsalProvider instance={msalInstance}>
    <Provider store={store}>
      <App />
    </Provider>
  </MsalProvider>
);
