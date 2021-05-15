
const authenticator = (req, res, next) => {
    if (!req.session.userId){
        res.redirect('/tweet')
    }
}

  module.exports=authenticator
