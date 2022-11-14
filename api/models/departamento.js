'use strict';
module.exports = (sequelize, DataTypes) => {
  const departamento = sequelize.define('departamento', {
    nombre: DataTypes.STRING,
    id_carrera: DataTypes.INTEGER
  }, {});
  departamento.associate = function(models) {
    departamento.hasMany(models.carrera// modelo al que pertenece
    ,{
      as : 'Carrera-Relacionada',  // nombre de mi relacion
      foreignKey: 'id'     // campo con el que voy a igualar
    })
  };
  return departamento;
};