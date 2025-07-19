import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App';
import reportWebVitals from './reportWebVitals';
import Footer from './pages/footer'; // ✅ Capitalized import

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Footer /> {/* ✅ Render the component */}
  </React.StrictMode>
);

reportWebVitals();
