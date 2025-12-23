
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Failed to render application:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; font-family: sans-serif;">
      <h2 style="margin-top: 0;">Application Error</h2>
      <p>Failed to start the application. Please check the console for details.</p>
      <pre style="white-space: pre-wrap; font-size: 12px;">${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
