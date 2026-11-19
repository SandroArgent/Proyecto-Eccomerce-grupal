import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Producto = sequelize.define('Producto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    precio: DataTypes.DECIMAL(10, 2),
    stock: DataTypes.INTEGER,
    marca: DataTypes.STRING,
    idMarca: DataTypes.INTEGER,
    destacado: DataTypes.BOOLEAN,
    caracteristicasDetalladas: DataTypes.TEXT,
    imagen: DataTypes.STRING,
    fechaCreacion: DataTypes.DATE,
    fechaModificacion: DataTypes.DATE,
  }, {
    tableName: 'productos',
    timestamps: false,
  });

  return Producto;
};