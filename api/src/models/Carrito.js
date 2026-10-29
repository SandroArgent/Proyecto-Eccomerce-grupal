import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Carrito = sequelize.define('Carrito', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  }, {
    tableName: 'carritos',
    timestamps: false,
  });

  return Carrito;
};