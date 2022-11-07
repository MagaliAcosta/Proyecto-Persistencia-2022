'use strict';
module.exports = (sequelize, DataTypes) => {
  const alumno = sequelize.define('alumno', {
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    id_carrera: DataTypes.INTEGER,
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true  
      }
    },
    dni: {
      type: DataTypes.INTEGER,
      validate: {
        isNumeric: true,
        len: [7,8]  
      }
    },
    password: DataTypes.STRING
  }, {});
  alumno.associate = function(models) {
    alumno.belongsTo(models.carrera
    ,{
      as : 'Carrera-Relacionada',  
      foreignKey: 'id_carrera'     
    })
  };
  return alumno;
};