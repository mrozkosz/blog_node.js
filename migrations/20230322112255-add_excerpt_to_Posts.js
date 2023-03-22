'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Posts', 'excerpt', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: ''
    });
  },

  down: (queryInterface, Sequelize) => {}
};
