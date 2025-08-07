import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminPanel from './components/AdminPanel';
import CategoryProducts from "./pages/CategoryProducts"; // adjust path

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Login />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
<Route path="/category/:categoryName" element={<CategoryProducts />} />
      </Routes>
    </Router>
  );
}

export default App;
