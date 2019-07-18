const express  = require('express');
const router = express.Router();
const {check , validationResult} = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt  = require('jsonwebtoken');
const config  = require('config');

const User =  require('../../models/User')

router.post('/',[
    check('name', 'name is required').not().isEmpty(),
    check('email', 'please include a v alid email').isEmail(),
    check('password', 'please enter a password with 6 or more characters').isLength({ min : 6})

],
async(req,res)=> {
    // console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        
        return res.status(400).json({errors : errors.array()});
    }

    const { name , email , password}  = req.body;
    
    try{
        let user = await User.findOne({email});
        //see if user exists 
        if (user){
           return  res.status(400).json({errors :[{msg : 'User already exists'}]});
         }

        // get users gravatar
         const avatar  = gravatar.url(email , {
             s:'200',
             r:'pf',
             d:'mm'
         })

         user = new User({
             name, email, avatar, password
         })
        //encrypt the password 
         const salt = await bcrypt.genSalt(10);

         user.password = await bcrypt.hash(password, salt);
        
         //this is how you handle promise
         user.save().then((e)=>{
            // res.json({
            //     message : 'saved bingo and understood prommise'
            // }); 
            //this apparently brings the error saying can not set headers after they are sent too the client
            console.log(user.name +'saved to db');
         });
         //return jsonwebtoken
         const payload =  {
             user:{
                 id: user.id
             }
         }
        jwt.sign(payload,config.get('jwtSecret'),
         {expiresIn : 360000},
         (err,token)=>{
             if(err) throw err ;
             res.json({token});
         }
    )
    } catch(err){
        console.log(err);
    }
    


    // res.send(req.body.name);
});

module.exports = router ; 