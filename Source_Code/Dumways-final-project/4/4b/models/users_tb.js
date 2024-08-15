'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class users_tb extends Model {
    static associate(models) {
      // Define association here
      users_tb.hasMany(models.provinsi_tb, {
        foreignKey: 'user_id', 
        as: 'provinsi'
      });
    }
  }

  users_tb.init({
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'users_tb',
    tableName: 'users_tb' 
  });

  return users_tb;
};
