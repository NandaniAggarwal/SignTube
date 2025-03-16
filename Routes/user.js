const express=require('express');
const router=express.Router();
const bcrypt=require('bcrypt');
require('dotenv').config();
const cloudinary=require('cloudinary').v2
const User= require('../Models/User')
const mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
const checkAyth=require('../middleware/checkAyth')


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
})

router.post('/signup',async(req,res)=>{
    try{
        const users = await User.find({ email: req.body.email });
if (users.length > 0) {
  return res.status(500).json({
    error: "email already registered"
  });
}

        const hashcode= await bcrypt.hash(req.body.password,10)
        const uploadedImage = await cloudinary.uploader.upload(req.files.logo.tempFilePath);
        const newUser = new User({
            _id: new mongoose.Types.ObjectId,
            channelName: req.body.channelName,
            email: req.body.email,
            phone: req.body.phone,
            password: hashCode,
            logoUrl: uploadedImage.secure_url,
            logoId: uploadedImage.public_id
          });
        const user=await newUser.save();
        res.status(200).json({
            newUser:user
        })          
    }catch(e){
        console.log(e);
        res.status(500).json({
            error:e
        })
    }
})

router.post('/login', async (req, res) => {
    try {
      console.log(req.body);
      const users = await User.find({ email: req.body.email });
      console.log(users);
  
      if (users.length === 0) {
        return res.status(500).json({
          error: 'Email not found'
        });
      }
      const isValid = await bcrypt.compare(req.body.password, users[0].password);
console.log(isValid);

if (!isValid) {
  return res.status(500).json({
    error: 'invalid password'
  });
}
const token = jwt.sign({
    _id: users[0]._id,
    channelName: users[0].channelName,
    email: users[0].email,
    phone: users[0].phone,
    logoId: users[0].logoId
  }, 
  'nandani purvi jiya', 
  {
    expiresIn: '365d'
  });
  
    res.status(200).json({ message: 'Login successful', user: users[0] });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: 'Something is wrong'
      });
    }

    res.status(200).json({
        _id: users[0]._id,
        channelName: users[0].channelName,
        email: users[0].email,
        phone: users[0].phone,
        logoId: users[0].logoId,
        logoUrl: users[0].logoUrl,
        token: token,
        subscribers: users[0].subscribers,
        subscribedChannels: users[0].subscribedChannels
    });
    
  });


router.put('/subscribe/:userBId',checkAyth,async(req,res)=>{
    try{
        const userA= await jwt.verify(req.headers.authorisation.split(" ")[1],'nandani purvi jiya')
        const userB=await User.findById(req.params.userBId)
        if(userA.subscribedBy.includes(userA._id)){
            return res.status(500).json({
                error:'already liked'
            })
        }
        userB.subscribers+=1
        userB.subscribedBy.push(userA._id);
        await userB.save()
        const userAfullinfo=await User.findById(userA._id);
        userAfullinfo.subscribedChannels.push(userB._id);
        await userAfullinfo.save();
        res.status(200).json({
            msg:'subscribed'
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

module.exports=router;