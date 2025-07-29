require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Get the MongoDB URI from environment variables
        const uri = process.env.DB;
        
        if (!uri) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }
        
        await mongoose.connect(uri);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;