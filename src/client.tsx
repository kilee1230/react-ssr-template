import { createRoot } from 'react-dom/client';
import App from './App';
import { ServerData } from './types';
import './index.css';

declare global {
  interface Window {
    __SERVER_DATA__: ServerData;
  }
}

const serverData = window.__SERVER_DATA__;

createRoot(document.getElementById('root')!).render(<App serverData={serverData} />);
