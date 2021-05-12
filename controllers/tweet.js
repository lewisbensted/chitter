const express= require('express')
const router= express.Router({mergeParams:true})

const {Reply, Tweet}=require('../models')

router.get('/', async function(req,res){
    const tweets=await Tweet.findAll({include:Reply})
    res.render('tweets/index.ejs', {tweets:tweets})
})

router.post('/', async function(req,res){
    await Tweet.create({
        text:req.body.tweet,
        UserId: req.session.userId
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