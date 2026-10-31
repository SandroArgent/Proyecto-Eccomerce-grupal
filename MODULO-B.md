# Módulo B — Mensajería por mail (Nodemailer)

## Qué hace
| Mail | Cuándo se dispara | Archivo / función |
|---|---|---|
| Bienvenida | Al registrarse | `authController.registrarUsuario` → `enviarBienvenida` |
| Recuperar contraseña | Al pedir "¿Olvidaste tu contraseña?" | `authController.olvideClave` → `enviarRecuperacionClave` |
| Pedido nuevo (cliente + admin) | Al confirmar la compra | `compraController.crearCompra` → `notificarPedidoCreado` |
| Cambio de estado | Cuando el admin cambia el estado | `compraController.actualizarEstadoCompraAdmin` → `notificarCambioEstado` |

Todo el envío vive en `api/src/services/mailService.js`. Lo agregado en otros archivos está marcado con el comentario `MÓDULO B`.

## Configuración (api/.env — copiar de api/.env.example)
- Sin `MAIL_HOST`: **modo prueba**, los mails se muestran en la consola del servidor y no se envían.
- Con Gmail: activar verificación en 2 pasos, crear una contraseña de aplicación en https://myaccount.google.com/apppasswords y completar `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASS`.
- `MAIL_ADMIN`: email que recibe el aviso de pedido nuevo (si está vacío, se usan los emails de la tabla de administradores).
- `FRONTEND_URL`: se usa para armar el enlace de recuperación (por defecto http://localhost:5173).

## Probar mails sin pasar por la tienda (desde api/)
    node src/scripts/probarMails.js bienvenida   tu@correo.com
    node src/scripts/probarMails.js recuperacion tu@correo.com
    node src/scripts/probarMails.js pedido       <idCompra>
    node src/scripts/probarMails.js estado       <idCompra> preparacion

## Después de bajar estos cambios
    cd api && npm install     # instala nodemailer
