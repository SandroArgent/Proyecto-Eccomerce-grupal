// api/seed.js
import crearAdministrador from "./src/models/Administrador.js";
import sequelize from "./src/config/database.js"; // 👈 default import

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión establecida con la base de datos");

    // Inicializar el modelo usando la función exportada
    const Administrador = crearAdministrador(sequelize);

    // Crear admin inicial
    const admin = await Administrador.create({
      nombre: "Ignacio",
      email: "admin@tienda.com",
      contraseña: "admin123" // se encripta automáticamente por el hook
    });

    console.log("✅ Admin creado:", admin.toJSON());
  } catch (error) {
    console.error("❌ Error al crear admin:", error.message);
  } finally {
    await sequelize.close();
  }
};

run();

// PARA CREAR ADMIN, EJEMPLO: node src/scripts/seedAdmin.js "Sandro" "sandroadmin@gmail.com" "Admin123456"