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
    date() {
      const date = new Date(this.createdAt)
      return `${date.getHours()}:${date.getMinutes()} ${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`
    }
  };
  Tweet.init({
    text: DataTypes.STRING, 
  }, {
    sequelize,
    modelName: 'Tweet',
  });
  return Tweet;
};