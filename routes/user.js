const { User } = require("../models/user.js");
const sendEmail = require('../utils/sendEmail.js');

const saveUser = async (fullName, email, number) => {
    try {
        let user = await User.findOne({email});
        if (user) {
            return {
                success: false,
                status: 409,
                message: "You are already registered"
            };
        }
        
        user = new User({ fullName, email, number });
        await user.save();
    } catch (error) {
        console.log(error);
        return {
            success: false,
            status: 500,
            message: "Internal server error"
        };
    }
}

module.exports = { saveUser };