import sequelize from '../config/database.js';
import UsuarioModel from './Usuario.js';
import TelefonoModel from './Telefono.js';
import CarritoModel from './Carrito.js';
import DomicilioModel from './Domicilio.js';
import CompraModel from './Compra.js';
import CompraProductoModel from './CompraProducto.js';
import ProductoModel from './Producto.js';
import ProductoPorCarritoModel from './ProductoPorCarrito.js';
import ImagenProductoModel from './ImagenProducto.js';
import CategoriaModel from './Categoria.js';
import AdministradorModel from './Administrador.js';

const Usuario = UsuarioModel(sequelize);
const Telefono = TelefonoModel(sequelize);
const Carrito = CarritoModel(sequelize);
const Domicilio = DomicilioModel(sequelize);
const Compra = CompraModel(sequelize);
const CompraProducto = CompraProductoModel(sequelize);
const Producto = ProductoModel(sequelize);
const ProductoPorCarrito = ProductoPorCarritoModel(sequelize);
const ImagenProducto = ImagenProductoModel(sequelize);
const Categoria = CategoriaModel(sequelize);
const Administrador = AdministradorModel(sequelize);

// Usuario - Telefono (1:n)
Usuario.hasMany(Telefono, { foreignKey: 'idUsuario' });
Telefono.belongsTo(Usuario, { foreignKey: 'idUsuario' });

// Usuario - Carrito (1:1)
Usuario.hasOne(Carrito, { foreignKey: 'idUsuario' });
Carrito.belongsTo(Usuario, { foreignKey: 'idUsuario' });

// Usuario - Domicilio (1:n)
Usuario.hasMany(Domicilio, { foreignKey: 'idUsuario' });
Domicilio.belongsTo(Usuario, { foreignKey: 'idUsuario' });

// Usuario - Compra (1:n)
Usuario.hasMany(Compra, { foreignKey: 'idUsuario' });
Compra.belongsTo(Usuario, { foreignKey: 'idUsuario' });

// Compra - Producto (N:M via CompraProducto)
Compra.hasMany(CompraProducto, { foreignKey: 'idCompra' });
CompraProducto.belongsTo(Compra, { foreignKey: 'idCompra' });
Producto.hasMany(CompraProducto, { foreignKey: 'idProducto' });
CompraProducto.belongsTo(Producto, { foreignKey: 'idProducto' });

// Categoria - Producto (1:n)
// as: 'Categoria' explícito porque la librería que usa Sequelize para
// pluralizar/singularizar nombres (inflection) confunde "Categoria" con
// una palabra de origen latino y arma mal el alias automático
// (terminaba generando "Categorium"). Con el alias fijo, no depende de
// que esa adivinanza le salga bien.
Categoria.hasMany(Producto, { foreignKey: 'idCategoria' });
Producto.belongsTo(Categoria, { foreignKey: 'idCategoria', as: 'Categoria' });

// Categoria - Categoria (padre/hijo)
Categoria.hasMany(Categoria, { as: 'subcategorias', foreignKey: 'idCategoriaPadre' });
Categoria.belongsTo(Categoria, { as: 'categoriaPadre', foreignKey: 'idCategoriaPadre' });

// Administrador - Producto (1:n)
Administrador.hasMany(Producto, { foreignKey: 'idAdministrador' });
Producto.belongsTo(Administrador, { foreignKey: 'idAdministrador' });

// Carrito - Producto (N:M via ProductoPorCarrito)
Carrito.hasMany(ProductoPorCarrito, { foreignKey: 'idCarrito' });
ProductoPorCarrito.belongsTo(Carrito, { foreignKey: 'idCarrito' });
Producto.hasMany(ProductoPorCarrito, { foreignKey: 'idProducto' });
ProductoPorCarrito.belongsTo(Producto, { foreignKey: 'idProducto' });

// Producto - ImagenProducto (1:n)
Producto.hasMany(ImagenProducto, { foreignKey: 'idProducto' });
ImagenProducto.belongsTo(Producto, { foreignKey: 'idProducto' });

export {
  sequelize,
  Usuario,
  Telefono,
  Carrito,
  Domicilio,
  Compra,
  CompraProducto,
  Producto,
  ProductoPorCarrito,
  ImagenProducto,
  Categoria,
  Administrador,
};


/* 
FLUJO (Exportacion e importaciones)
models/index.js  →  controllers  →  routes  →  cliente
  (exporta)         (importa)      (usa) 
  
  En cada controlador hacés un require (o import) del models/index.js y usás los modelos que necesitás: 
    

¿Por que exportar Secualize?
  Porque la instancia sequelize es la conexión con la base de datos. Los modelos ya la usan internamente, pero a veces la necesitás directamente para:

    Transacciones: sequelize.transaction()
    Consultas SQL raw: sequelize.query('SELECT ...')
    Sincronizar/forzar tablas: sequelize.sync({ force: true })
    Cerrar la conexión: sequelize.close()
  En resumen: los modelos son las tablas; sequelize es el cable que las conecta a la base de datos. A veces necesitás el cable directamente. */
