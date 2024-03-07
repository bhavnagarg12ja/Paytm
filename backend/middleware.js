const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) =>{    
    // Extract the authorization header from the request
    const authHeader = req.headers.authorization;

    // Check if authorization header exists and starts with 'Bearer'
    //If not, return 403 Forbidden status with an error message
    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(403).json({
            message: "Invalid User"
        })
    }

    // Extract the token from the authorization header
    const token = authHeader.split(' ')[1];
    try{
        // Verify the JWT token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if decoded token contains a userId field
        if(decoded.userId){
            req.userId = decoded.userId; // If yes, set the userId in the request object
            next(); // Call the next middleware function
        }else{
            // If userId is not present in the decoded token, return 403 Forbidden status with an error message
            return res.status(403).json({
                message: "Invalid User"
            });
        }   
    }catch (err){
        // If an error occurs during token verification, return 403 Forbidden status with an error message
        return res.status(403).json({
            message: "Invalid User"
        });
    }
};

module.exports = {
    authMiddleware
}