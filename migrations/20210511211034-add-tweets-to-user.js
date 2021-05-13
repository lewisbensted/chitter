'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
     await queryInterface.addColumn('Tweets', 'UserId', {
        type:Sequelize.INTEGER,
        references:{
          model:{
            tableName:'Users'
          },
          key:'id'
        },
        onDelete:'cascade',
        allowNull: false
     })
  },
  

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tweets', 'UserId')
  }
};
