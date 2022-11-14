'use strict';
module.exports = (sequelize, DataTypes) => {
  const carrera = sequelize.define('carrera', {
    nombre: DataTypes.STRING,
    id_departamento: DataTypes.STRING
  }, {});

  carrera.associate = function(models) {
    carrera.belongsTo(models.departamentos// modelo al que pertenece
    ,{
      as : 'Carrera-Relacionada',  // nombre de mi relacion
      foreignKey: 'id_departamento'     // campo con el que voy a igualar
    })
  };
  
  return carrera;
};