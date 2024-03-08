const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { User,Account } = require("../db");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");

//signup API
const signupBody = zod.object({
    username : zod.string().email(),
    firstname : zod.string(),
    lastname : zod.string(),
    password : zod.string()
})

router.post("/signup", async(req, res)=>{
   try{
    const { success } = signupBody.safeParse(req.body);
    console.log(success)
    if(!success){
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

     // Checking if the provided username (email) already exists in the database
    const existingUser = await User.findOne({
        username : req.body.username
    })
    console.log(existingUser)
     // If user with the same email already exists
    if(existingUser){
        return res.status(411).json({
            message: "Email already taken"
        })
    }
    
    // Creating a new user in the database using the provided information
    const user = await User.create({
        username : req.body.username,
        firstname : req.body.firstname,
        lastname : req.body.lastname,
        password : req.body.password
    });

    console.log("user" + user)

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
   }catch(e){
    console.log(e)
   }
})

//signin api
const signInBody = zod.object({
    username: zod.string().email(),
	password: zod.string()
})
router.post("/signin", async(req,res)=>{
    try{
    const { success} = signInBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }
    const user = await User.findOne({
        username : req.body.username,
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
   }catch(e){
    console.log(e);
   }
})

//update api
const updateBody = zod.object({
	firstname: zod.string(),
	lastname: zod.string(),
    password: zod.string()
})
router.put("/" , authMiddleware , async(req,res)=>{
    try{
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
    }catch(e){
        console.log(e);
    }
})

router.get("/bulk", async(req, res)=>{
// If the "filter" parameter is not provided, it defaults to an empty string.
    const filter = req.query.filter || "";

// Find users in the database that match the specified filter criteria
// MongoDB $regex operator: provides regular expression capabilities for pattern matching strings in queries
// Search for users whose first or last name matches the provided filter using regular expression
    const users = await User.find({
        $or: [{
            firstname: {
                "$regex": filter
            }
        },{
            lastname: {
                "$regex": filter
            }
        }]
    })

// Respond with a JSON object containing user data, mapping each user object to a new object with a subset of properties
    res.json({
        user: users.map(user => ({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            _id: user._id
        }))
    })
})

module.exports = router;