const express= require('express')
const router= express.Router()
const bcrypt=require('bcrypt')

const {User}=require('../models')

router.get('/', async function(req,res){
    res.render('login/index.ejs', {error:''})
})

router.post('/', async function(req,res){
    const user= await User.findOne({where:{email:req.body.email}})
    if (user && bcrypt.compareSync(req.body.password, user.dataValues.passwordHash)){
        req.session.userId=user.dataValues.id 
        req.session.username=user.dataValues.username
        console.log(req.session.username)
        res.redirect('tweet')
    } else {
        res.render('login/index.ejs', {error:'Invalid email or password'})
    }
})

router.delete('/', async function(req,res){
    delete req.session.userId
    delete req.session.username
    res.redirect('/')
})



module.exports=router