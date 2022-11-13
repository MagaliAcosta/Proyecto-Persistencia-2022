'use strict';
module.exports = (sequelize, DataTypes) => {
  const carrera = sequelize.define('carrera', {
    nombre: DataTypes.STRING,
    id_departamento: DataTypes.STRING
  }, {});
  carrera.associate = function(models) {
    // associations can be defined here
    carrera.belongsTo(models.departamento, {
      as : 'Departamento-Relacionada',
      foreignKey: 'id_departamento',
      // sourceKey: 'id'
    })
  };
  
  return carrera;
};