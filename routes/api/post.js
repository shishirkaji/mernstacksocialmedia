const express  = require('express');
const router = express.Router();
const {check,validationResult}= require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const profile = require('../../models/Profile');
const User = require('../../models/User');
// const Post = require('../../models/Post');
//@route POST ai/posts 
//@desc create a new post
//@access Private
router.post('/',[auth,[
    check('text',"Text is required" )
    .not()
    .isEmpty()

]],async (req,res)=> {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({error : error.array()});
    }
    try{
    const user = await User.findById(req.user.id).select('-passowrd');
    
    const newPost = new Post({
        text:req.body.text,
        name : user.name,
        avatar : user.avatar,
        user : req.user.id
    })
    const post = await newPost.save();
    res.json(post);    
}
catch(err){
    console.log(err);
    res.status(500).send("server error");
}
    
});

module.exports = router ; 