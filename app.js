const express=require('express');
const app=express();
require('dotenv').config();
const mongoose= require('mongoose');
const bodyParser=require('body-parser');
const fileUpload=require('express-fileupload')

mongoose.connect(process.env.MONGO_URI)
.then(res=>{
    console.log("connected mongodb");
})
.catch(err=>{
    console.log(err);
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:'/tmp/'
}))

// *********************
const userRoute=require('../Youtube/Routes/user');
const videoRoute=require('../Youtube/Routes/video');
const commentRoute=require('../Youtube/Routes/comment');

app.use('/user',userRoute);
app.use('/video',videoRoute);
app.use('/comment',commentRoute);

app.get('/',(req,res)=>{
    res.send("running")
})


module.exports=app;