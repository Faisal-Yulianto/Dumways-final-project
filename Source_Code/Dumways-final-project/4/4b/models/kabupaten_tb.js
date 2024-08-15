'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class kabupaten_tb extends Model {
    static associate(models) {
      // Define association here
      kabupaten_tb.belongsTo(models.provinsi_tb, {
        foreignKey: 'provinsi_id', 
        as: 'provinsi'
      });
    }
  }

  kabupaten_tb.init({
    nama: DataTypes.STRING,
    diresmikan: DataTypes.STRING,
    photo: DataTypes.STRING,
    provinsi_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'kabupaten_tb',
    tableName: 'kabupaten_tb'
  });

  return kabupaten_tb;
};
