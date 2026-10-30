import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Domicilio = sequelize.define('Domicilio', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    calle: DataTypes.STRING,
    numero: DataTypes.STRING,
    piso: DataTypes.STRING,
    departamento: DataTypes.STRING,
    barrio: DataTypes.STRING,
    localidad: DataTypes.STRING,
    ciudad: DataTypes.STRING,
    provincia: DataTypes.STRING,
    pais: DataTypes.STRING,
    tipo: DataTypes.STRING,
    codigoPostal: DataTypes.STRING,
  }, {
    tableName: 'domicilios',
    timestamps: false,
  });

  return Domicilio;
};