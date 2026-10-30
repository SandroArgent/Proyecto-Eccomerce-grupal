import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Telefono = sequelize.define('Telefono', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero: DataTypes.STRING,
    tipo: DataTypes.STRING,
  }, {
    tableName: 'telefonos',
    timestamps: false,
  });

  return Telefono;
};