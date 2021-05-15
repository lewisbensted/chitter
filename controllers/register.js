const express= require('express')
const router= express.Router()
const bcrypt=require('bcrypt')

const {User}=require('../models')

router.get('/', function(req,res){
    res.render('register/index.ejs', {errors:{errors:[]}})
})

router.post('/', async function(req,res){
    if (req.body.password.length<5){
        res.render('register/index.ejs', {errors:{errors:[{message:'Password length must be between 5 and 20 charachters'}]}})
    } else {
        const hash=bcrypt.hashSync(req.body.password, 5)
        await User.create({
            username:req.body.username,
            passwordHash:hash,
            email:req.body.email,
            name:req.body.name
        }).then(user=>{
            res.redirect('/')
        }).catch(errors=>{
            console.log()
            res.render('register/index.ejs', {errors:errors})
        })
    }
})

module.exports=router

