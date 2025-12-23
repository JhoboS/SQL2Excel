
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

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
      <p>无法启动应用，请查看浏览器控制台 (F12) 了解详情。</p>
      <pre style="white-space: pre-wrap; font-size: 12px;">${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
