
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
  console.error("Critical error during application mount:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; color: #ef4444; font-family: sans-serif;">
      <h2>Application Failed to Load</h2>
      <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  `;
}
