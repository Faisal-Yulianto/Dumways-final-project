'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class provinsi_tb extends Model {
    static associate(models) {
      // Define association here
      provinsi_tb.belongsTo(models.users_tb, {
        foreignKey: 'user_id', 
        as: 'user'
      });
      provinsi_tb.hasMany(models.kabupaten_tb, {
        foreignKey: 'provinsi_id', 
        as: 'kabupaten'
      });
    }
  }

  provinsi_tb.init({
    nama: DataTypes.STRING,
    diresmikan: DataTypes.STRING,
    photo: DataTypes.STRING,
    pulau: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'provinsi_tb',
    tableName: 'provinsi_tb'
  });

  return provinsi_tb;
};
