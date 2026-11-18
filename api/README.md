

CONFIGURACION DEL .ENV de API/
# BASE DE DATOS
DB_NAME=ecommerce_tienda_musical
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306

# NODEMAILER - GMAIL
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=tuemail@gmail.com                    (Admin EMAIL) servirá para ser remitente hacia el destinatario.
MAIL_PASS=tu_contraseña_de_aplicacion          (QUITARLE TODOS LOS ESPACIOS) Es la contraseña que creas con el enlace de abajo (linea 24)
MAIL_ADMIN=tuemail@gmail.com                    (mismo mail de admin)

# FRONTEND
FRONTEND_URL=http://localhost:5173



Crear ADMIN remitente, pasos a seguir.
Activar verificacion en 2 pasos
https://myaccount.google.com/signinoptions/two-step-verification?utm_source=chatgpt.com
Para crear una cuentraseña de aplicacion / esta clave irá en la linea 16 de este texto.
https://myaccount.google.com/apppasswords?utm_source=chatgpt.com

Para crear un admin desde el Seeder. EJEMPLO
node src/scripts/seedAdmin.js "Sandro" "sandroadmin@gmail.com" "Admin123456"

SUBIDA DE IMÁGENES (Multer)
Instalar la dependencia una vez: npm install (multer ya está en package.json).
Las imágenes de productos se guardan en api/uploads/productos/ (la carpeta se crea sola
y está en .gitignore, así que cada integrante tiene sus propias imágenes locales).
Se sirven en http://localhost:3000/uploads/productos/<archivo>.
POST /api/productos y PUT /api/productos/:id ahora reciben multipart/form-data:
  - campos de texto: nombre, precio, stock, etc.
  - imagenes: hasta 5 archivos (JPG, PNG, WEBP o GIF, máx. 5 MB c/u)
  - imagenesEliminar (solo PUT): JSON con los ids de imágenes a quitar, ej. "[3,5]"
