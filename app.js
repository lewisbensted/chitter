const express = require('express')
const app = express()
const port = 3000
const methodOverride = require('method-override')


app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

const messageController=require('./controllers/message.js')
app.use('/message', messageController)

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})