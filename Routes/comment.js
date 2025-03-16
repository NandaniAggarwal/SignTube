const express=require('express');
const router=express.Router();
const Comment= require('../Models/Comment')
const checkAyth= require('../middleware/checkAyth')
const jwt=require('jsonwebtoken')

router.post('/new-comment/:videoId',checkAyth,async(req,res)=>{
    try{
        const verifiedUser= await jwt.verify(req.headers.authorisation.split(" ")[1],'nandani purvi jiya')
        const newComment=new Comment({
             _id: new mongoose.Types.ObjectId,
             videoId: req.params.videoId,
            userId: verifiedUser._id,
            commentText:req.body.commentText
        })
        const comment= await newComment.save();
        res.status(200).json({
            newComment:Comment
        })
    }catch(e){
        console.log(e);
        res.status(500).json({
            error:e
        })
    }
})

router.post('/:videoId',async(req,res)=>{
    try{
        const comments=await Comment.find({videoId:req.params.videoId}).populate('userId','channelName','logoUrl')
        res.status(200).json({
            commentList:comments
        })
    }catch(e){
        console.log(e);
        res.status(500).json({
            error:e
        })
    }
})

module.exports=router;