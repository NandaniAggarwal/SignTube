const express=require('express');
const router=express.Router();
const checkAyth= require('../middleware/checkAyth')
const jwt=require('jsonwebtoken')
const cloudinary=require('cloudinary').v2
const Video= require('../Models/Video')
const mongoose=require('mongoose')

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
})

router.post('/upload', checkAyth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const user = await jwt.verify(token, 'sbs online classes 123')
        
        const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath,{
            resource_type:'video'
        })
        const uploadedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
        const newVideo = new Video({
            _id: new mongoose.Types.ObjectId,
            title: req.body.title,
            description: req.body.description,
            user_id: user._id,
            videoUrl: uploadedVideo.secure_url,
            videoId: uploadedVideo.public_id,
            thumbnailUrl: uploadedThumbnail.secure_url,
            thumbnailId: uploadedThumbnail.public_id,
            category:req.body.category,
            tags: req.body.tags.split(",")
        });
        const newvideouploaded=await newVideo.save();
        res.status(200).json({
            newVideo:newvideouploaded
        })  
        
    } 
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

router.put('/like/:videoId',checkAyth,async(req,res)=>{
    try{
        const verifiedUser= await jwt.verify(req.headers.authorisation.split(" ")[1],'nandani purvi jiya')
        const video=await Video.findById(req.params.videoId)
        if(video.likedBy.includes(verifiedUser._id)){
            return res.status(500).json({
                error:'already liked'
            })
        }
        video.likes+=1
        video.likedBy.push(verifiedUser._id);
        await video.save()
        res.status(200).json({
            msg:'liked'
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

router.put('/views/:videoId',async(req,res)=>{
    try{
        const video=await Video.findById(req.params.videoId)
        video.views+=1;
        await video.save();
        res.status(200).json({
            msg:'ok'
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

module.exports=router;