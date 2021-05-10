const db = require('../models')

const createTweet = async () => {
  console.log('creating tweet')
    await db.Reply.create({
      text: 'seeded test reply',
      createdAt: new Date(1995, 9, 12, 10, 40),
      updatedAt: new Date(1995, 9, 12, 10, 40),
      Tweet:{
        text: 'seeded test tweet',
        createdAt: new Date(1995, 9, 12, 10, 30),
        updatedAt: new Date(1995, 9, 12, 10, 30),
      }
    }, {
      include: [{
        association: db.Reply.Tweet
      }]
    }
  )}


module.exports = createTweet