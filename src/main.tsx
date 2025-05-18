import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'react-hot-toast';

// Ловим ошибки инициализации
try {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Element with id "root" not found!');
    throw new Error('Root element not found');
  }
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
        }}
      />
    </StrictMode>
  );
} catch (error) {
  console.error('Application failed to initialize:', error);
  // Показываем сообщение об ошибке на странице
  document.body.innerHTML = `
    <div style="color: red; padding: 20px;">
      <h1>Application Error</h1>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
