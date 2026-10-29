// Footer.jsx - Pie de página de la tienda.
//
// A propósito, NO tiene ningún link al panel de admin (/admin/login).
// Es una decisión de seguridad: exponer esa URL en la tienda pública le
// facilita el trabajo a cualquiera que quiera probar fuerza bruta contra
// el login de administrador. Los administradores acceden escribiendo la
// URL directamente, no navegando desde la tienda.

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
      <p>© {new Date().getFullYear()} Ecommerce — Proyecto Integrador</p>
    </footer>
  );
}

export default Footer;

