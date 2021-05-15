const express= require('express')
const router= express.Router({mergeParams:true})
const auth=require('./../middleware/auth.js')

const {Reply, Tweet}=require('../models')

function date(input) {
    const date = new Date(input)
    return `${date.getHours()}:${date.getMinutes()} ${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`
  }

router.get('/', async function(req,res){
    const tweetsObj=await Tweet.findAll({include:Reply})
    const tweets = tweetsObj.map(t=>t.dataValues)
    for (let tweet of tweets){
        tweet.date= date(tweet.createdAt)
        tweet.Replies.sort((a,b)=>{return b.createdAt-a.createdAt})
    }
    tweets.sort((a,b)=>{return b.createdAt-a.createdAt})
    res.render('tweets/index.ejs', {tweets:tweets})
})

router.post('/', async function(req,res){
    await Tweet.create({
        text:req.body.tweet,
        UserId: req.session.userId,
        username:req.session.username
    })
    res.redirect('/tweet')
})

router.delete('/:tweetId', async function(req,res){
    await Tweet.destroy({
        where:{
            id:req.params.tweetId}
        })
    res.redirect('/tweet')
})

router.get('/:tweetId/edit', async function(req,res){
    auth(req,res)
    const tweet=await Tweet.findOne({
        where:{id:req.params.tweetId}
    })
    res.render('tweets/edit.ejs', {tweet:tweet})
})

router.put('/:tweetId', async function(req,res){
    await Tweet.update(
        {text:req.body.text},
        {where:{id:req.params.tweetId}}
    )
    res.redirect('/tweet')
})



module.exports=router