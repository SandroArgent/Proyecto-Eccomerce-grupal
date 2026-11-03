import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ImagenProducto = sequelize.define('ImagenProducto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: DataTypes.STRING,
    urlImagen: DataTypes.STRING,
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'imagenes_producto',
    timestamps: false,
  });

  return ImagenProducto;
};