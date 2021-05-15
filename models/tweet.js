'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tweet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        this.Replies=this.hasMany(models.Reply, {onDelete:'cascade'})
        this.User=this.belongsTo(models.User)
    }
    
  };
  Tweet.init({
    text: DataTypes.STRING, 
    username:DataTypes.STRING 
  }, {
    sequelize,
    modelName: 'Tweet',
  });
  return Tweet;
};