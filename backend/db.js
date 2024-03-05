const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://bhavnagarg12ja:G%40rgBh%40vn%402129@cluster0.zdyihlz.mongodb.net/User")

//creating schema for User table
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    }
});
//Creating model for schema
const User = mongoose.model('User', userSchema);

module.exports = {
    User
}