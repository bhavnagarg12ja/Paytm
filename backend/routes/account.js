const express = require("express");
const { authMiddleware } = require("../middleware");
const { default: mongoose } = require("mongoose");
const router = express.Router();

router.get("/balance", authMiddleware, async(req, res)=>{
    // Find the account associated with the authenticated user in the database
    const account = await Account.findOne({
        userId: req.userId
    });

    // Respond with a JSON object containing the balance of the account
    res.json({
        balance: account.balance
    })
})

router.post("/transfer", authMiddleware, async(req, res)=>{
    let session; // Declare a variable to store the session
try{
    // Start a new session for transaction management
    session = await mongoose.startSession();
    session.startTransaction();

    // Extract 'amount' and 'to' fields from the request body
    const{ amount, to } = req.body;

    // Find the account of the authenticated user
    const account = await Account.findOne({
        userId: req.userId
    }).session(session);
            
    // Check if the account exists and has sufficient balance for the transfer
    if(!account || account.balance < amount){
        await session.abortTransaction(); // Abort the transaction if conditions are not met
        return res.status(411).json({
            message: "Insufficient Balance"
        });
    }
    
    // Find the account to which the transfer is being made
    const toAccount = await Account.findOne({
        userId: to
    }).session(session)

    // Check if the destination account exists
    if(!toAccount){
        await session.abortTransaction(); // Abort the transaction if conditions are not met
        return res.status(411).json({
            message: "Invalid Account"
        });
    }

    // Update the balance of the sender's account by subtracting the transfer amount
    await Account.updateOne({userId: req.userId},{$inc: {balance: -amount}}).session(session);

    // Update the balance of the recipient's account by adding the transfer amount
    await Account.updateOne({userId: to},{$inc: {balance: amount}}).session(session);

    // Commit the transaction if all updates are successful
    await session.commitTransaction();

    // Respond with a success message
    res.json({
        message: "Transfer successful"
    });

}catch(error){
    // If any error occurs during the transaction, handle it here
    // Rollback the transaction and respond with an error message
    if (session) {
        await session.abortTransaction();
    }
    console.error("Transaction failed:", error);
    res.status(411).json({
        message: "Transaction failed"
    });
}finally {
    // Finally, end the session
    if (session) {
        session.endSession();
    }
}
})

module.exports = router;