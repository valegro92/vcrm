import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppWithDB from './AppWithDB';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWithDB />
  </React.StrictMode>
);
