import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Crie o contexto
export const AuthContext = createContext();

// Provider do contexto
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [name, setName] = useState(localStorage.getItem('nome') || null); // Corrigido o nome da função para setName
  const navigate = useNavigate();

  // Atualiza o token no localStorage e no estado
  const updateToken = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  // Atualiza o nome no localStorage e no estado
  const updateName = (newName) => { // Corrigido de getName para updateName
    localStorage.setItem('nome', newName);
    setName(newName); // Corrigido de userName para setName
  };

  // Lógica de logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nome'); // Remover o nome ao deslogar
    setToken(null);
    setName(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ token, name, updateToken, updateName, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
