const db = require('./../models')

const truncateTables = () => {
  console.log('truncating tables')
  db.Tweet.destroy({ truncate : true, cascade: true })
}

module.exports = truncateTables
