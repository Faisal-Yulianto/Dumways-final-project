'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Menambahkan foreign key dari provinsi_tb ke users_tb
    await queryInterface.addConstraint('provinsi_tb', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_provinsi_user', // nama constraint
      references: {
        table: 'users_tb',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Menambahkan foreign key dari kabupaten_tb ke provinsi_tb
    await queryInterface.addConstraint('kabupaten_tb', {
      fields: ['provinsi_id'],
      type: 'foreign key',
      name: 'fk_kabupaten_provinsi', // nama constraint
      references: {
        table: 'provinsi_tb',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Menghapus foreign key dari provinsi_tb ke users_tb
    await queryInterface.removeConstraint('provinsi_tb', 'fk_provinsi_user');

    // Menghapus foreign key dari kabupaten_tb ke provinsi_tb
    await queryInterface.removeConstraint('kabupaten_tb', 'fk_kabupaten_provinsi');
  }
};

