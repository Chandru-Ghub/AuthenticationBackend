const express = require('express');
const app = express();
const PORT = 6000;
const mongoose = require('mongoose')
const cors = require('cors')
const userSchema = require('./model/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv').config()

const key = process.env.KEY
// console.log(key);
//middle Wares
app.use(cors(
    // {
    //     origin:['http://localhost:5173'],
    //     methods:['GET','POST'],
    //     credentials : true
    // }
))
app.use(express.json())
app.use(cookieParser())


app.get('/',async (req,res)=>{
    try{
        const data = await userSchema.find()
        res.send(data)
    }catch(err){
        res.json(err)
    }
    
})

//jwt verification

const verifyUser = (req,res,next)=>{
    const tooken = req.cookies.token;
    console.log(tooken);
    if(!tooken){
        return res.json('The token was not available')
    }else{
        jwt.verify(tooken,key,(err,decoded)=>{
            if(err) return res.json('Wrong token')
            next()
        })
    }
}

app.get('/home',verifyUser,(req,res)=>{
        return res.json('Success')
})

//New user registration.........................
app.post('/register', async(req,res)=>{
        console.log('register');
    try{
        const {name,email,password} = req.body;

        //Using bcrypt to hash the password
        const hashPass = await bcrypt.hash(password,10)
        console.log(hashPass)

        //pass the hashed password to the data base
        const register = await userSchema.create({name,email, password:hashPass})
        res.status(201).json(register)
        console.log(register);
    }catch(err){
        res.status.json(err);
    }
  
   
})


//Verifying the Login.............................
app.post('/verify', async(req,res)=>{

    try{
        const {email,password} = req.body;
        const register = await userSchema.findOne({email:email})

        const comparePassword = await bcrypt.compare(password,register.password)
        // console.log(comparePassword,'okok')
        if(comparePassword){
            if(register){
                const token = jwt.sign(
                    {email: register.email},
                    key,

                    {expiresIn:'1d'})
                res.cookie('token',token)
                res.json('Success')
                console.log('true');
            }
            // else{
            //     res.json('user not found ')
            // }
        }
        else{
            res.json('Incorrect Password')
        }
      
    }catch(err){
        res.json('user Not Found');
        console.log('false');
    }
  
   
})

//Forgot password page............................

app.post('/forgot-password',(req,res)=>{
    const {email} = req.body;
    userSchema.findOne({email:email})
    .then(user=>{
        if(!user){
            res.json('n')
        }
        else{
        const token = jwt.sign({id:user._id},key,{expiresIn:'1d'})

        var nodemailer = require('nodemailer');
       
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{

                user: 'chandrumech455@gmail.com',
                pass: 'xuxovtfkvomairak'
            }

        });

        var mailOptions = {

            from: 'chandrumech455@gmail.com',
            to: 'chandruinfo455@gmail.com',
            subject: 'Reset your password',
            text: `http://localhost:5173/reset_password/${user._id}/${token}/`
        };



        transporter.sendMail(mailOptions, (err,info)=>{

            if(err){
                console.log(err);
            }else{
                console.log('message '+ info.response);
                return res.send( 'Success')
                
            }
        });
    }
    })
})


///Reset password.............

app.post('/reset-password/:id/:token',(req,res)=>{
    const {id,token} = req.params
    const {password} = req.body

    jwt.verify(token,key,(err,decoded)=>{
        if(err){
            res.json(err)
        }else{
            bcrypt.hash(password,10)
            .then(hash=>{
                userSchema.findByIdAndUpdate({_id:id},{password:hash})
                .then(result => res.send({Status:'Success'}))
                .catch(err => res.send({Status: err}))
            })
           .catch(err => res.send({Status: err}))
        }
    })
})

//connecting to the database ATLAS
mongoose.connect('mongodb+srv://chandruinfo455:fBziCs1GHica2J2X@cluster0.iv4dkzt.mongodb.net/Authentication?retryWrites=true&w=majority').then(result=>console.log('DB connected sucessfully'));


//connecting to the database LOCAL compass
// mongoose.connect('mongodb://127.0.0.1:27017/Authentication').then(result=>console.log('DB connected sucessfully'));

//Connecting to the Server in port
app.listen(PORT,()=>{
    console.log('Server running in port ',PORT);
})