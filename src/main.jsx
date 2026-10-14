import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Dynamic Tailwind CSS fallback injection
const style = document.createElement('style');
style.innerHTML = `@import "tailwindcss";`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
