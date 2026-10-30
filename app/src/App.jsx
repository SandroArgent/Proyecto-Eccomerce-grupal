import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { AdminAuthProvider } from './context/AdminAuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import RutaProtegida from './components/auth/RutaProtegida.jsx'
import RutaProtegidaAdmin from './components/auth/RutaProtegidaAdmin.jsx'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import Inicio from './pages/Inicio.jsx'
import Catalogo from './pages/Catalogo.jsx'
import ProductoDetalle from './pages/ProductoDetalle.jsx'
import Carrito from './pages/Carrito.jsx'
import Checkout from './pages/Checkout.jsx'
import MisPedidos from './pages/MisPedidos.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'
import Perfil from './pages/Perfil.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminProductos from './pages/admin/AdminProductos.jsx'
import AdminCategorias from './pages/admin/AdminCategorias.jsx'

import './App.css'

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Zona pública / cliente: lleva el Header de la tienda */}
              <Route
                path="/*"
                element={
                  <div className="flex min-h-screen flex-col bg-slate-50">
                    <Header />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Inicio />} />
                        <Route path="/catalogo" element={<Catalogo />} />
                        <Route path="/productos/:id" element={<ProductoDetalle />} />
                        <Route path="/carrito" element={<Carrito />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/registro" element={<Registro />} />
                        <Route
                          path="/perfil"
                          element={
                            <RutaProtegida>
                              <Perfil />
                            </RutaProtegida>
                          }
                        />
                        <Route
                          path="/checkout"
                          element={
                            <RutaProtegida>
                              <Checkout />
                            </RutaProtegida>
                          }
                        />
                        <Route
                          path="/pedidos"
                          element={
                            <RutaProtegida>
                              <MisPedidos />
                            </RutaProtegida>
                          }
                        />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                }
              />

              {/* Zona admin: layout propio, sin el Header de la tienda */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <RutaProtegidaAdmin>
                    <AdminLayout />
                  </RutaProtegidaAdmin>
                }
              >
                <Route index element={<Navigate to="productos" replace />} />
                <Route path="productos" element={<AdminProductos />} />
                <Route path="categorias" element={<AdminCategorias />} />
                
                
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AdminAuthProvider>
    </AuthProvider>
  )
}

export default App
