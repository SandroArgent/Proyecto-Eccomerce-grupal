import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const CompraProducto = sequelize.define('CompraProducto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cantidad: DataTypes.INTEGER,
    precioUnitario: DataTypes.DECIMAL(10, 2),
    subTotal: DataTypes.DECIMAL(10, 2),
  }, {
    tableName: 'compra_productos',
    timestamps: false,
  });

  return CompraProducto;
};