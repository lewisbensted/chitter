const createTestTweet=require('./../../test-data/create-test-tweet.js')
const createTestUser=require('./../../test-data/create-test-user.js')
const createTestReply=require('./../../test-data/create-test-reply.js')
const truncateTables=require('./../../test-data/db-reset.js')

module.exports = (on, config) => {
  on('task', {
    resetDb() {
      console.log('resetting Db')
      truncateTables()
      return null
   }, 
   createUser(){
      console.log('creating test user')
      createTestUser()
      return null
   },
   createTweet(){
    console.log('creating test tweet')
    createTestTweet()
    return null
  },
  createReply(){
    console.log('creating test reply')
    createTestReply()
    return null
  }
})}

