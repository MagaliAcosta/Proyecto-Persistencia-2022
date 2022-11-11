'use strict';
module.exports = (sequelize, DataTypes) => {
  const alumnos = sequelize.define('alumnos', {
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    dni: DataTypes.INTEGER,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    id_carrera: DataTypes.INTEGER
  }, {});
  alumnos.associate = function(models) {
    alumnos.belongsTo(models.carrera// modelo al que pertenece
    ,{
      as : 'Carrera-Relacionada',  // nombre de mi relacion
      foreignKey: 'id_carrera'     // campo con el que voy a igualar
    })
  };
  return alumnos;
};