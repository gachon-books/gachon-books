const fs = require('fs');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const express = require('express');
const passport = require('passport');
const User = require('../schemas/user');
const session = require('express-session');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

router.post('/', isNotLoggedIn, (req, res, next) => {
  let htmlstream = fs.readFileSync(__dirname + '/../views/error.ejs','utf8');

  passport.authenticate('local', (authError, user, info) => {
    if(authError) {
      console.error(authError);
      return next(authError);
    }
    
    if(!user) {
      return res.end(ejs.render(htmlstream, {
        error: {
          'status': 562,
          'stack': '아이디나 비밀번호가 일치하지 않습니다.'
        },
        message: '아이디나 비밀번호가 일치하지 않습니다.'
      }));
    }

    return req.login(user, (loginError) => {
      if(loginError) {
        console.error(loginError);
        return next(loginError);
      }
      req.session.user = user;
      return res.redirect('/');
    });
  })(req, res, next);
});

module.exports = router;