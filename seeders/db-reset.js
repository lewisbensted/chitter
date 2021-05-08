const db = require('./../models')

const truncateTables = () => {
  console.log('truncating tables')
  db.Message.destroy({ truncate : true, cascade: true })
}

module.exports = truncateTables
