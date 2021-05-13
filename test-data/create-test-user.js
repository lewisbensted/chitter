const db = require('../models')
const bcrypt=require('bcrypt')

const createUser = async () => {
    console.log('creating user')
    const hash=bcrypt.hashSync('testpassword2', 5)
    await db.User.create({
        email: 'testuser2@test.com',
        passwordHash: hash,
        name:'test user two',
        username:'testuser2'
      })
    }

module.exports=createUser