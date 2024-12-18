import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import './index.css';
import App from './App.tsx';
import 'antd/dist/reset.css';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './services/msalService';

createRoot(document.getElementById('root')!).render(
  <MsalProvider instance={msalInstance}>
    <Provider store={store}>
      <App />
    </Provider>
  </MsalProvider>
);
