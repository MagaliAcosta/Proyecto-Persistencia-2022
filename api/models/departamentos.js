'use strict';
module.exports = (sequelize, DataTypes) => {
  const departamentos = sequelize.define('departamentos', {
    nombre: DataTypes.STRING
  }, {});

  departamentos.associate = function(models) {
    departamentos.hasMany(models.carrera
    ,{
      as : 'Carreras-Relacionadas',  // nombre de mi relacion
      foreignKey: 'id_departamento',
      sourceKey: 'id'     // campo con el que voy a igualar
    })
  };
  return departamentos;
};