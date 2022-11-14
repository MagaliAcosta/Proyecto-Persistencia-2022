'use strict';
module.exports = (sequelize, DataTypes) => {
  const profesores = sequelize.define('profesores', {
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    dni: DataTypes.INTEGER,
    id_materia: DataTypes.INTEGER
  }, {});
  
  profesores.associate = function(models) {
    profesores.belongsTo(models.materia// modelo al que pertenece
    ,{
      as : 'Materia-Relacionada',  // nombre de mi relacion
      foreignKey: 'id_materia'     // campo con el que voy a igualar
    })
  };
  return profesores;
};