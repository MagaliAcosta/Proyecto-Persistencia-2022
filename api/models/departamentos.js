'use strict';
module.exports = (sequelize, DataTypes) => {
  const departamentos = sequelize.define('departamentos', {
    nombre: DataTypes.STRING
  }, {});
 
  return departamentos;
};