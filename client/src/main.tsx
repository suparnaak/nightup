import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes'; // or './routes/index'
import './index.css'; // if you have tailwind or global styles

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
);
