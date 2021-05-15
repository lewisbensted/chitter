'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.Tweets=this.hasMany(models.Tweet, {onDelete:'cascade'})
      this.Replies=this.hasMany(models.Reply, {onDelete: 'cascade'})
    }
  };
  User.init({
    name: {
          type: DataTypes.STRING,
          allowNull:false,
          validate: {
             not:{
               args: /[^a-z ]/i, 
               msg:'Name can only contain letters'},
             notEmpty:{
               msg:'Please enter a name'}
          }},   
    username: {
          type: DataTypes.STRING,
          unique:true,
          allowNull:false,
          validate:{
              len:{args:[5], msg:'Username must be five charachters long'},
              isUnique:  (value, next) => {
                User.findOne({where: {username: value}})
                   .then( (user) => {
                       if (user) {
                           return next('Username address already in use');
                       }
                       return next();
                   }).catch(function (error) {
                     return next(error);
                 })
               }}
          },
          
    email: {
          type: DataTypes.STRING,
          unique:true,
          allowNull:false,
          validate: {
            isEmail:{msg:'Invalid email address'},
            isUnique:  (value, next) => {
               User.findOne({where: {email: value}})
                  .then( (user) => {
                      if (user) {
                          return next('Email address already in use');
                      }
                      return next();
                  }).catch(function (error) {
                    return next(error);
                })
              }}
  },
        
    passwordHash: {
          type: DataTypes.STRING
        }        
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};