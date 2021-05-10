const express= require('express')
const router= express.Router({mergeParams:true})

const {Tweet, Reply}=require('../models')


router.get('/', async function(req,res){
    const tweet=await Tweet.findOne({where:{id:req.params.tweetId}})
    res.render('replies/add.ejs', {tweet:tweet})
})

router.post('/', async function(req,res){
    
    await Reply.create(
        {text:req.body.text,
        TweetId:req.params.tweetId})
    res.redirect('/tweet')
})

module.exports=router