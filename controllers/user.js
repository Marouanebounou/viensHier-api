const User = require("../models/user");

const saveUser = async (fullName, email, number) => {
    try {
        let userExists = await User.findOne({ email });
        if (userExists) {
            return {
                success: false,
                status: 409,
                message: "You are already registered"
            };
        }
        
        const user = new User({
            fullName,
            email,
            number
        });
        
        await user.save();
        console.log(`User ${fullName} saved successfully`);
        return user;
    } catch (error) {
        console.error('Error saving user:', error);
        throw error; 
    }
};
module.exports = {saveUser};