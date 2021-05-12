'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
     await queryInterface.addColumn('Replies', 'UserId', {
        type:Sequelize.INTEGER,
        references:{
          model:{
            tableName:'Users'
          },
          key:'id'
        },
        onDelete:'cascade',
        allowNull:false
  },
  

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Replies', 'UserId')
  }
}
