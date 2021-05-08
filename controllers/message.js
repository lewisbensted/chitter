const express= require('express')
const router= express.Router()

const Message=require('./../models').Message

router.get('/', async function(req,res){
    const messages=await Message.findAll()
    console.log(messages)
    res.render('message/index.ejs', {messages:messages})
})

router.post('/', async function(req,res){
    await Message.create({text:req.body.tweet})
    res.redirect('/message')
})

router.delete('/:messageId', async function(req,res){
    await Message.destroy({where:{id:req.params.messageId}})
    res.redirect('/message')
})

router.get('/:messageId/edit', async function(req,res){
    const tweet=await Message.findOne({where:{id:req.params.messageId}})
    res.render('message/edit.ejs', {tweet:tweet})
})

router.put('/:messageId', async function(req,res){
    await Message.update({text:req.body.text},{where:{id:req.params.messageId}})
    res.redirect('/message')
})



module.exports=router