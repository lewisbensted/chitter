const db = require('../models')
const bcrypt=require('bcrypt')

const createUser = async () => {
    console.log('creating user')
    const hash=bcrypt.hashSync('testpassword1', 5)
    await db.User.create({
        email: 'testuser1@test.com',
        passwordHash: hash,
        name:'test user one',
        username:'testuser1'
      })
    }

module.exports=createUser