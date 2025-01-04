const mongoose = require('mongoose');

const connect = mongoose.connect(process.env.MONGO_URL);

const connection = mongoose.connection;
connection.on('connected', () => {
    console.log('MongoDB Connection Successfull');
});

connection.on('error', (err) => {
    console.log('MongoDB Connection Failed');
});


module.exports = mongoose;