'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
     await queryInterface.addColumn('Replies', 'TweetId', {
        type:Sequelize.INTEGER,
        references:{
          model:{
            tableName:'Tweets'
          },
          key:'id'
        },
        onDelete:'cascade',
        allowNull: false
     })
  },
  

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Replies', 'TweetId')
  }
};
