module.exports = {
    eAdmin: function(req,res,next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){ //serve para verificar se um certo usuario esta autenticado ou n
            return next()
           
        }

        req.flash("error_msg", "Acesso apenas para Admins")
        res.redirect("/")
    }
}