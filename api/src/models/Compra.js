import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Compra = sequelize.define('Compra', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fecha: DataTypes.DATE,
    total: DataTypes.DECIMAL(10, 2),
    medioPago: DataTypes.STRING,
    estadoPago: DataTypes.STRING,
    comprobanteURL: DataTypes.STRING,
    estadoEnvio: DataTypes.STRING,
  }, {
    tableName: 'compras',
    timestamps: false,
  });

  return Compra;
};