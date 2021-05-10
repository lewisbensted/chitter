const createTestTweet=require('../../seeders/create-tweet')
const createTestUser = require('../../seeders/create-user')
const truncateTables=require('./../../seeders/db-reset.js')

module.exports = (on, config) => {
  on('task', {
    resetDb() {
      console.log('resetting Db')
      truncateTables()
      return null
   }, 
   createTweet(){
      console.log('creating test tweet')
      createTestTweet()
      return null
   },
   createUser(){
     console.log('creating test user')
     createTestUser()
     return null
   } 
  }
)}
