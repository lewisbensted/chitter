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
        TweetId:req.params.tweetId,
        UserId:req.session.userId,
        username:req.session.username
    })
    res.redirect('/tweet')
})

router.delete('/:replyId', async function(req,res){
    await Reply.destroy({
        where:{
            id:req.params.replyId}
        })
    res.redirect('/tweet')
})

router.get('/:replyId/edit', async function(req,res){
    const tweet=await Tweet.findOne({
        where:{id:req.params.tweetId}
    })
    const reply=await Reply.findOne({
        where:{id:req.params.replyId}
    })
    res.render('replies/edit.ejs', {tweet:tweet, reply:reply})
})

router.put('/:replyId', async function(req,res){
    await Reply.update(
        {text:req.body.text},
        {where:{id:req.params.replyId}}
    )
    res.redirect('/tweet')
})



module.exports=router