// AdminAuthContext.jsx — estado global de sesión del ADMINISTRADOR.
// Es el equivalente a AuthContext.jsx, pero para el otro tipo de sesión.
// Los mantenemos separados a propósito: mezclar "usuario" y "administrador"
// en un solo contexto obligaría a chequear en cada lugar "¿esto es un
// cliente o un admin?", y es más fácil equivocarse así.

import { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin } from '../services/adminAuthService.js';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [administrador, setAdministrador] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  // No armamos este proyecto con un endpoint de "perfil de admin" ni de
  // "refresh", así que al arrancar solo restauramos lo que ya había en
  // localStorage. Si el token guardado expiró, la primera petición que
  // haga el panel (por ejemplo, pedir los productos) va a fallar con 401
  // y ahí recién se entera; no lo validamos de entrada como sí hacemos
  // con el usuario cliente.
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('adminToken');
    const adminGuardado = localStorage.getItem('administrador');

    if (tokenGuardado && adminGuardado) {
      setAdminToken(tokenGuardado);
      setAdministrador(JSON.parse(adminGuardado));
    }

    setCargando(false);
  }, []);

  const login = async (email, contraseña) => {
    const respuesta = await loginAdmin(email, contraseña);
    // respuesta = { estado: true, mensaje, token, administrador: {...} }
    localStorage.setItem('adminToken', respuesta.token);
    localStorage.setItem('administrador', JSON.stringify(respuesta.administrador));

    setAdminToken(respuesta.token);
    setAdministrador(respuesta.administrador);

    return respuesta.administrador;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('administrador');
    setAdminToken(null);
    setAdministrador(null);
  };

  const value = {
    administrador,
    adminToken,
    isAdminAuthenticated: !!administrador,
    cargando,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth debe ser usado dentro de un AdminAuthProvider');
  }
  return context;
}
