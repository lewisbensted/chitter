const express = require('express')
const app = express()
const port = 3000
const methodOverride = require('method-override')


app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

const tweetController=require('./controllers/tweet.js')
const replyController=require('./controllers/reply.js')
app.use('/tweet', tweetController)
app.use('/tweet/:tweetId/reply', replyController)

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})