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
    password : zod.string()
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

// Create new account with some random account
    await Account.create({
        userId,
        balance: Math.random() * 10000
    })

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
    await User.updateOne({
        _id: req.userId
    }, req.body)
    res.json({
        message: "Updated Successfully"
    })
})

router.get("/bulk", async(req, res)=>{
// If the "filter" parameter is not provided, it defaults to an empty string.
    const filter = req.query.filter || "";

// Find users in the database that match the specified filter criteria
// MongoDB $regex operator: provides regular expression capabilities for pattern matching strings in queries
// Search for users whose first or last name matches the provided filter using regular expression
    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        },{
            lastName: {
                "$regex": filter
            }
        }]
    })

// Respond with a JSON object containing user data, mapping each user object to a new object with a subset of properties
    res.json({
        user: users.map(user => ({
            userName: user.username,
            firstName: user.firstname,
            lastName: user.lastname,
            _id: user._id
        }))
    })
})

module.exports = router;