import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Marca = sequelize.define(
    'Marca',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'marcas',
      timestamps: false,
    }
  );

  return Marca;
};