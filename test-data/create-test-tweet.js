const db = require('../models')
const bcrypt=require('bcrypt')


createTweet = async() =>{
    const hash1=bcrypt.hashSync('testpassword1', 5)
    const hash2=bcrypt.hashSync('testpassword2', 5)
    const user1 = await db.User.create({
      email: 'testuser1@test.com',
      passwordHash: hash1,
      name:'test user one',
      username:'testuser1'
    })
    await db.Tweet.create({
      text: 'test tweet 1',
      username:'testuser1',
      UserId:user1.id, 
      createdAt: new Date(1995, 9, 12, 10, 00)
    })
    const user2 = await db.User.create({
      email: 'testuser2@test.com',
      passwordHash: hash2,
      name:'test user two',
      username:'testuser2'
    })
    await db.Tweet.create({
      text: 'test tweet 2',
      username:'testuser2',
      UserId:user2.id, 
      createdAt: new Date(1995, 9, 12, 11, 00)
    })
}

module.exports=createTweet