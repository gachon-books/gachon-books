const mongoose = require('mongoose');

/*
  [mongoose 연결]
  database 이름은 local, 사용하는 컬렉션은 user입니다.
*/
module.exports = () => {
    const connect = () => {
        if(process.env.NODE_ENV !== 'production') {
            mongoose.set('debug', true);
        }
        mongoose.connect('mongodb://localhost:27017/local', {
            dbName: 'local',
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (error) => {
            if(error)
                console.log('mongodb 연결 실패', error);
            else
                console.log('mongodb 연결 성공');
        });
    };

    connect();

    mongoose.connection.on('error', (error) => {
        console.log('mongodb 연결 실패', error);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('mongodb 연결 끊김. 재시도 ...');
        connect();
    });

    require('./database');
};