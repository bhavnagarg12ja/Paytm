const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { User } = require("../db");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");

//signup API
const signupBody = zod.object({
    userName : zod.string().email(),
    firstName : zod.string(),
    lastName : zod.string(),
    password : zos.string()
})

router.post("/signup", async(req, res)=>{
    const { success } = signupBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

     // Checking if the provided username (email) already exists in the database
    const existingUser = await User.findOne({
        userName : req.body.username
    })

     // If user with the same email already exists
    if(existingUser){
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }
    
    // Creating a new user in the database using the provided information
    const user = await User.create({
        userName : req.body.username,
        firstName : req.body.firstname,
        lastName : req.body.lastname,
        password : req.body.password
    });

 // Extracting the user ID from the created user
    const userId = user._id;

 // Generating JWT token using the user ID and secret key
    const token = jwt.sign({
        userId
    }, JWT_SECRET);

 // Sending response with success message and token
    res.json({
        message: "User created succesfully",
        token: token
    });
})

//signin api
const signInBody = zod.object({
    username: zod.string().email(),
	password: zod.string()
})
router.post("/signin", async(req,res)=>{
    const { success} = signInBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }
    const user = await User.findOne({
        userName : req.body.username,
        password: req.body.password
    });

    if(user){
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
        res.json({
            token: token
        })
        return;
    }
    res.status(411).json({
        message: "Error while logging in"
    })
})

//update api
const updateBody = zod.object({
	firstName: zod.string(),
	lastName: zod.string(),
    password: zod.string()
})
router.put("/" , authMiddleware , async(req,res)=>{
    const {success} = updateBody.safeParse(req.body);
    if(!success){
        res.status(411).json({
            message: "Error while updating information"
        })
    }
    await User.updateOne(req.body,{
        id: req.userId
    })
    res.json({
        message: "Updated Successfully"
    })
})

module.exports = router;