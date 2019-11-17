const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../schemas/user');

module.exports = (passport) => {
    passport.use(new LocalStrategy({
        usernameField: 'loginid',
        passwordField: 'loginpw',
    }, async (id, password, done) => {
        try {
            let users = await User.findOne(
                { id: id }
            );

            if(users) {
                let result = await bcrypt.compare(password, users.password);
                if(result) {
                    done(null, users);
                }
                else {
                    done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                }
            }
            else {
                done(null, false, { message: '가입되지 않은 회원입니다.'});
            }
        }
        catch(error) {
            console.error(error);
            done(error);
        }
    }));
};