const db = require('../models')
const bcrypt=require('bcrypt')
console.log(db.User)


const createUser = async () => {
  console.log('creating user')
  const hash=bcrypt.hashSync('seededtestpassword', 5)
  await db.User.create({
    email: 'seededtest@test.com',
    passwordHash: hash,
    name:'seeded test man',
    username:'seededtestman1'
  })
}

module.exports = createUser