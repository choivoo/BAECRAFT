import { createRoot } from 'react-dom/client';
import { AppProvider } from './ui/store';
import App from './App';
import './ui/styles.css';
createRoot(document.getElementById('root')!).render(<AppProvider><App /></AppProvider>);
