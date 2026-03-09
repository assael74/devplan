import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App'
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// === Service Worker for FCM ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then(reg => {
        console.log('SW registered:', reg.scope);
      })
      .catch(err => {
        console.error('SW registration failed:', err);
      });
  });
}

reportWebVitals();
