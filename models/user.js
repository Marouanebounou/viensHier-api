const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const joi = require("joi");

const userSchema = new mongoose.Schema({
    fullName: {type: String , required: true},
    email:{type:String, required:true, unique:true},
    number:{type:Number ,required:true}
});
const User = mongoose.model("User", userSchema);
module.exports = User;