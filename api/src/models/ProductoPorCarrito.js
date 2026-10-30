import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ProductoPorCarrito = sequelize.define('ProductoPorCarrito', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cantidad: DataTypes.INTEGER,
  }, {
    tableName: 'producto_por_carrito',
    timestamps: false,
  });

  return ProductoPorCarrito;
};