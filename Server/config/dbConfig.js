const mongoose = require('mongoose');

async function main() {
    try {
    mongoose.connect(process.env.MONGO_URL);
    console.log("db connected");
    } catch (error) {
    console.log("db not connected");
    }
    }
    
    
    main();


module.exports = mongoose;