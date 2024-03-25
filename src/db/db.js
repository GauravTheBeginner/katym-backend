const mongoose = require('mongoose')
// use env file to store the mongo uri
require('dotenv').config()
const MONGO_URI = process.env.MONGO_URI



const connectToMongo = async () => {
    try {
        await mongoose.connect(MONGO_URI)
        console.log("connected")
    } catch (error) {
        console.log(error)
    }


}
connectToMongo();

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
})

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});

const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model("User", userSchema);

module.exports = { User, Account }