const mongoose = require("mongoose");

const url = process.env.MONGO_URI;

const connectDB = async () => {
    return await mongoose.connect(url);
}

module.exports = {
    connectDB
}