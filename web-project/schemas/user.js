const mongoose = require('mongoose');

/*
    [user 컬렉션 스키마]
    id: 아이디(Unique)
    password: 패스워드(bcrypt 암호화 적용)
    name: 이름
    address: 시/군
    favorite: 즐겨찾기 목록(Array)
*/
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