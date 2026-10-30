// AuthContext.jsx provee el estado global de autenticación para toda la aplicación.
// Guarda el usuario logueado y el token JWT en memoria y en localStorage.

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUsuario, registrarUsuario, obtenerPerfilUsuario } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  // useCallback mantiene estable la referencia de "logout" entre renders.
  // Esto importa porque "validarSesion" la usa como dependencia y a su vez
  // el useEffect de abajo depende de "validarSesion": si "logout" cambiara
  // de referencia en cada render, se generaría un loop infinito de pedidos
  // al backend.
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  }, []);

  // Al cargar la app (o refrescar la página), si hay un token guardado
  // le pedimos el perfil al backend para confirmar que sigue siendo válido.
  // No usamos un endpoint de "refresh" (este proyecto no tiene todavía),
  // así que el token no se renueva solo: cuando expire, esta llamada va a
  // fallar y se va a cerrar la sesión automáticamente.
  const validarSesion = useCallback(async () => {
    const tokenGuardado = localStorage.getItem('token');

    if (!tokenGuardado) {
      setCargando(false);
      return;
    }

    setToken(tokenGuardado);

    try {
      const usuarioActualizado = await obtenerPerfilUsuario();
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      setUsuario(usuarioActualizado);
    } catch (error) {
      console.warn('El token guardado no es válido o expiró:', error.message);
      logout();
    } finally {
      setCargando(false);
    }
  }, [logout]);

  useEffect(() => {
    validarSesion();
  }, [validarSesion]);

  // Iniciar sesión
  const login = async (email, contraseña) => {
    const respuesta = await loginUsuario(email, contraseña);
    // respuesta = { estado: true, mensaje, token, usuario: {...} }
    localStorage.setItem('token', respuesta.token);
    localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));

    setToken(respuesta.token);
    setUsuario(respuesta.usuario);

    return respuesta.usuario;
  };

  // Registrarse e iniciar sesión automáticamente
  const registro = async (datos) => {
    const respuesta = await registrarUsuario(datos);
    // respuesta = { estado: true, mensaje, token, usuario: {...} }
    localStorage.setItem('token', respuesta.token);
    localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));

    setToken(respuesta.token);
    setUsuario(respuesta.usuario);

    return respuesta.usuario;
  };

  const value = {
    usuario,
    token,
    isAuthenticated: !!usuario,
    cargando,
    login,
    registro,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {cargando ? (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
          <p className="text-sm font-medium">Verificando sesión...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// Hook personalizado para acceder fácilmente al contexto de autenticación.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
