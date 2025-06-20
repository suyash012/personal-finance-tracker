import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Budgets from './components/Budgets';
import Reports from './components/Reports';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, AuthContext } from './AuthContext';
import { jwtDecode } from 'jwt-decode';
import './App.css';

function Sidebar() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  let email = '';
  if (token) {
    try {
      const decoded = jwtDecode(token);
      email = decoded.email || '';
    } catch {}
  }
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="sidebar">
      {token && <div className="user-info">{email && `Logged in as: ${email}`}</div>}
      <Link to="/dashboard" className="sidebar-link">Dashboard</Link>
      <Link to="/expenses" className="sidebar-link">Expenses</Link>
      <Link to="/budgets" className="sidebar-link">Budgets</Link>
      <Link to="/reports" className="sidebar-link">Reports</Link>
      {!token && <Link to="/login" className="sidebar-link login-link">Login</Link>}
      {!token && <Link to="/register" className="sidebar-link register-link">Register</Link>}
      {token && <button onClick={handleLogout} className="logout-button">Logout</button>}
    </div>
  );
}

function PrivateRoute({ children }) {
  const { token } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
              <Route path="/budgets" element={<PrivateRoute><Budgets /></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
