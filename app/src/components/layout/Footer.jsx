// Footer.jsx - Pie de página de la tienda.
//
// A propósito, NO tiene ningún link al panel de admin (/admin/login).
// Es una decisión de seguridad: exponer esa URL en la tienda pública le
// facilita el trabajo a cualquiera que quiera probar fuerza bruta contra
// el login de administrador. Los administradores acceden escribiendo la
// URL directamente, no navegando desde la tienda.

function Footer() {
  return (
    <footer className="bg-indigo-900 text-white ">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-4">

          <div>
            <h3 className="mb-3 text-lg font-bold">
              SONORA MUSIC STORE
            </h3>

            <p className="text-sm text-indigo-100">
              Instrumentos musicales,
              audio profesional y
              accesorios para músicos.
            </p>
          </div>

          

        </div>

        <div className="mt-8 border-t border-indigo-500 pt-4 text-center text-sm text-indigo-200">
          © {new Date().getFullYear()} Sonora Music Store
        </div>
      </div>
    </footer>
  );
}

export default Footer;