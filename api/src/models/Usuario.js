import { DataTypes } from 'sequelize';
import { encriptarPassword } from '../utils/auth.js';

export default (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // El email identifica al usuario, no puede repetirse.
    },
    contraseña: DataTypes.STRING,
    rol: DataTypes.STRING,
  }, {
    tableName: 'usuarios',
    timestamps: false,
    hooks: {
      // Antes de crear un usuario, encriptamos la contraseña.
      beforeCreate: async (usuario) => {
        if (usuario.contraseña) {
          usuario.contraseña = await encriptarPassword(usuario.contraseña);
        }
      },
      // Antes de actualizar, encriptamos la contraseña solo si fue modificada.
      // Sin este "if", cada vez que se actualice el usuario (aunque sea
      // solo el teléfono) se volvería a hashear un hash ya existente,
      // rompiendo el login.
      beforeUpdate: async (usuario) => {
        if (usuario.changed('contraseña')) {
          usuario.contraseña = await encriptarPassword(usuario.contraseña);
        }
      },
    },
  });

  return Usuario;
};