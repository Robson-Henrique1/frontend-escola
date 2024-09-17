import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Importe o AuthProvider
import Login from './components/Login';
import Dashboard from './components/Dashboard';


const App = () => {
  return (

      <Router>
            <AuthProvider>
        <Routes>
        <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        </AuthProvider>
      </Router>

  );
};

export default App;
