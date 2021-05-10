const createTweet=require('../../seeders/create-tweet')
const truncateTables=require('./../../seeders/db-reset.js')

module.exports = (on, config) => {
  on('task', {
    resetDb() {
      console.log('running resetDb task')
      truncateTables()
      return null
   }, 
   seedDb(){
      console.log('running seedDb task')
      createTweet()
      return null
   }
  }
)}
