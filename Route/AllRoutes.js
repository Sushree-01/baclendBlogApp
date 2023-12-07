const express=require("express");
const {userModel}=require("../Models/users.Model");
const {blogModel}=require("../Models/blogs.Model");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken")
const {authentication}=require("../Middleware/auth");

const allRouter=express.Router();
allRouter.post("/register",async(req,res)=>{
    const {username,avatar,email,password}=req.body;
    let currentUser=await userModel.findOne({email});
    try {
        if(!currentUser){
            bcrypt.hash(password,5,async(err,hash)=>{
                if(err){
                    res.status(400).send({msg:"Something Is Wrong,Please Try Again!!!"});
                    return;
                }
                let user=new userModel({username,avatar,email,password:hash});
                await user.save();
                res.status(201).send({msg:"User Account has Created Successfully!"})
            })
        }else{
            res.status(400).send({msg:"Email has Already Exists."})
        }
    }catch(error){
        res.status(500).send({msg:"Internal Server Error Happening!!"})
    }
})

allRouter.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    let user=await userModel.findOne({email});
    try {
        if(user){
            bcrypt.compare(password,user.password,async(err,result)=>{
                if(result){
                    let token=jwt.sign({userId: user._id,username:user.username},"Sushree");
                    res.status(200).send({msg:"Logged in Successfully!!",token,userId:user._id});
                }else{
                    res.status(400).send({msg:"Wrong Email Adderss or password."})
                }
            })
        }else{
            res.status(400).send({msg:"User doesn't Exists,please Register!!"})
        }
    }catch(error){
        res.status(500).send({msg:"Internal Server Error!!"})
    }
})

allRouter.get("/blogs",authentication,async(req,res)=>{
    const {title,category,sort,order}=req.query;
    try {
        let query={};
        if(title!==""){
            query.title={$regex:new RegExp(title,"i")}
        }
        if(category!==""){
            query.category={$regex:new RegExp(category,"i")}
        }
        let sorting={};
        if(sort!=="" && order!==""){
            let sortOrder=(order==="asc")?1:-1;
            sorting.sort=sortOrder;
        }
        let blog=await blogModel.find(query).sort(sorting);
        res.status(200).send({blog})
    }catch(error){
        res.status(500).send({msg:"Internal Server Error!!"})
    }
})

allRouter.post("/blogs",authentication,async(req,res)=>{
    try {
        let data=new blogModel(req.body);
        await data.save();
        res.status(200).send({msg:"Blog Has Created Successfully!!",data});
    }catch(error){
        res.status(500).send({msg:"Internal Server Error Happening!"})
    }
})

allRouter.patch("/blogs/:id",authentication,async(req,res)=>{
    const {id}=req.params;
    try {
        let updateed_Blogs=await blogModel.findByIdAndUpdate({_id:id,userId:req.body.userId},req.body);
        res.status(200).send({msg:"Blog Updated Successfully!!"});
    } catch (error) {
        res.status(500).send({msg:"Internal Server Error Happening!"})
    }
})

allRouter.delete("/blogs/:id",authentication,async(req,res)=>{
    const {id}=req.params;
    try {
        let deleted_Blogs=await blogModel.findByIdAndDelete({_id:id,userId:req.body.userId});
        res.status(200).send({msg:"Blog has been Deleted Successfully!!"});
    }catch(error){
        res.status(500).send({msg:"Internal Server Error Happening!"})
    }
})

allRouter.patch("/blogs/:id/like",authentication,async(req,res)=>{
    const {id}=req.params;
    try {
        let blogs=await blogModel.findOne({_id:id});
        let value=blogs.likes+1;
        req.body={...req.body,likes:value};
        let updateLike=await blogModel.findByIdAndUpdate({_id:id},req.body);
        res.status(200).send({msg:"Like Increased by 1"});
    }catch(error){
        res.status(500).send({msg:"Internal Server Error!!"})
    }
})

allRouter.patch("/blogs/:id/comment",authentication,async(req,res)=>{
    const {id}=req.params;
    try {
        let blogs=await blogModel.findOne({_id:id});
        let value={username:req.body.username,content:req.body.content};
        blogs.comments.push(value);
        let updated_Comments=await blogModel.findByIdAndUpdate({_id:id},blogs);
        res.status(200).send({msg:"Comments has been Published Successfully!!"});
    }catch(error){
        res.status(500).send({msg:"Internal Server Error happening!"})
    }
})
module.exports = {allRouter};