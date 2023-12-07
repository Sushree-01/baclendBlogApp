const jwt=require("jsonwebtoken");
const authentication=(req,res,next)=>{
    let token=req.headers.authorization?.split(" ")[1];
    if(token){
        jwt.verify(token,"Sushree",(err,decoded)=>{
            if(decoded){
                let date=new Date().toLocaleDateString()
                req.body={...req.body, username:decoded.username,userId:decoded.userId,date:date};
                next();
            }else{
                res.status(400).send({msg:"Please Try To Login!!"})
            }
        })
    }else{
        res.status(400).send({msg:"Please Try To Login!!"})
    }
}
module.exports = {authentication};