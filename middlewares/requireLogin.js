function requireLogin(req , res , next){
    
    if(req.session.username){
        console.log('ada');
        return next()
    }
    else{
        return res.send({
            message:"Redirect"
        })
    }
}

export default requireLogin