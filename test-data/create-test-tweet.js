const db = require('../models')
const bcrypt=require('bcrypt')


createTweet = async() =>{
    const hash=bcrypt.hashSync('testpassword1', 5)
    const user = await db.User.create({
      email: 'testuser1@test.com',
      passwordHash: hash,
      name:'test user one',
      username:'testuser1'
    })
    await db.Tweet.create({
      text: 'test tweet 1',
      UserId:user.id, 
      createdAt: new Date(1995, 9, 12, 10, 30)
    })
}

module.exports=createTweet