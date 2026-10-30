import { DataTypes } from 'sequelize';
import { encriptarPassword } from '../utils/auth.js';

export default (sequelize) => {
  const Administrador = sequelize.define('Administrador', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: DataTypes.STRING,
    contraseña: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'administradores',
    timestamps: false,
    hooks: {
      beforeCreate: async (admin) => {
        if (admin.contraseña) {
          admin.contraseña = await encriptarPassword(admin.contraseña);
        }
      },
      beforeUpdate: async (admin) => {
        if (admin.changed('contraseña')) {
          admin.contraseña = await encriptarPassword(admin.contraseña);
        }
      },
    },
  });

  return Administrador;
};