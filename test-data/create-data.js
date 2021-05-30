const db = require('../models')
const bcrypt=require('bcrypt')

const createReply = async () => {
  console.log('creating reply')
  const hash1=bcrypt.hashSync('seededtestpassword', 5)
  const hash2=bcrypt.hashSync('secondseededtestpassword', 5)

  const tweet=await db.Tweet.create({
    text: 'seeded test tweet',
    createdAt: new Date(1995, 9, 12, 10, 30),
    updatedAt: new Date(1995, 9, 12, 10, 30),
    User:{
      email: 'seededtest@test.com',
      passwordHash: hash1,
      name:'seeded test man',
      username:'seededtestman1'
    }
  }, {
    include: [{
      association: db.Tweet.User
    }]
  })

  await db.Reply.create({
    text: 'seeded test reply',
    createdAt: new Date(1995, 9, 12, 10, 40),
    updatedAt: new Date(1995, 9, 12, 10, 40), 
    User:{
        email: 'secondseededtest@test.com',
        passwordHash: hash2,
        name:'second seeded test man',
        username:'secondseededtestman2'
      },
    Tweet:{text:'j',
          }
      

    }, {
      include: [{
        association: db.Reply.Tweet,
        association: db.Reply.User,
      }]
    }
  )


}



module.exports = createReply