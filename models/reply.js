'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reply extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.Tweet=this.belongsTo(models.Tweet)
      this.User=this.belongsTo(models.User)
    }
    date() {
      const date = new Date(this.createdAt)
      return `${date.getHours()}:${date.getMinutes()} ${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`
    }
  };
  Reply.init({
    text: DataTypes.STRING,
    username: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Reply',
  });
  return Reply;
};