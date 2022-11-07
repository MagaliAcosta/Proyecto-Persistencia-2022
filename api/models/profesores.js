'use strict';
module.exports = (sequelize, DataTypes) => {
  const profesores = sequelize.define('profesores', {
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    id_materia: DataTypes.INTEGER
  }, {});
  profesores.associate = function(models) {
    
    profesores.belongsTo(models.materia
    ,{
      as : 'Materia-Relacionada',  
      foreignKey: 'id_materia'     
    })
    
  };
  return profesores;
};