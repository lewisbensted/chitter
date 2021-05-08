

const truncateTables=require('./../../seeders/db-reset.js')

module.exports = (on, config) => {
  on('task', {
    resetDb() {
      console.log('running resetDb task')
      truncateTables()
      return null
   }}
)}
