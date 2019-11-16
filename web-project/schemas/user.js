const mongoose = require('mongoose');

const { Schema } = mongoose;
const userSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    favorite: [{
        no: String,
        cityName: String,
        name: String,
        addr: String
    }]
});

module.exports = mongoose.model('User', userSchema);