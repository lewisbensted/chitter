const express = require('express')
const app = express()
const port = 3000
const methodOverride = require('method-override')
const session=require('express-session')


app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(session({
    secret:'secret-key',
    resave:false,
    saveUninitialized:false
}))

const {User}=require('./models')

app.use(async (req, res, next) => {
    res.locals.currentUser = (req.session.userId ? await User.findOne({
      where: {
        id: req.session.userId
      }
    }) : undefined)
    next()
  })

const tweetController=require('./controllers/tweet.js')
const replyController=require('./controllers/reply.js')
const homepageController=require('./controllers/home.js')
const registerController=require('./controllers/register.js')
const loginController=require('./controllers/login.js')

app.use('/', homepageController)
app.use('/register', registerController)
app.use('/login', loginController)
app.use('/tweet', tweetController)
app.use('/tweet/:tweetId/reply', replyController)



app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})