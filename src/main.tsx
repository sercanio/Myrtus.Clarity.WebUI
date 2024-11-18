import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import './index.css';
import App from './App.tsx';
import 'antd/dist/reset.css';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const connection = new HubConnectionBuilder()
  .withUrl('/auditLogHub')
  .configureLogging(LogLevel.Information)
  .build();

connection.start().catch((err) => console.error('Connection failed: ', err));

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <App />
    </Provider>
);
