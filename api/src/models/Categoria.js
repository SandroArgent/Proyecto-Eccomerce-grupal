import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Categoria = sequelize.define('Categoria', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: DataTypes.STRING,
  }, {
    tableName: 'categorias',
    timestamps: false,
  });

  return Categoria;
};