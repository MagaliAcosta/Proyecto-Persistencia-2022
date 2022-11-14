'use strict';
module.exports = (sequelize, DataTypes) => {
  const carrera = sequelize.define('carrera', {
    nombre: DataTypes.STRING,
    id_departamento: DataTypes.STRING
  }, {});
  
  return carrera;
};