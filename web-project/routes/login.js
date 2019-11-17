const fs = require('fs');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const express = require('express');
const passport = require('passport');
const User = require('../schemas/user');
const session = require('express-session');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

/*
  [로그인] /login (POST)
  1 메인 페이지에서 로그인 모달 창의 '로그인' 버튼을 클릭하면 진입합니다.
  2 passport 모듈의 로컬 전략(/passport/localStrategy.js 참조)에 따라
    성공하면 세션에 로그인 정보를 넣고 메인 페이지로 이동하고, 실패하면 에러 페이지로 보냅니다.
*/
router.post('/', isNotLoggedIn, (req, res, next) => {
  // 에러 페이지 정보
  let htmlstream = fs.readFileSync(__dirname + '/../views/error.ejs','utf8');

  // passport 인증
  passport.authenticate('local', (authError, user, info) => {
    if(authError) {
      console.error(authError);
      return next(authError);
    }
    
    // 아이디나 비밀번호가 일치하지 않을 경우 에러 페이지로 redirect
    if(!user) {
      return res.end(ejs.render(htmlstream, {
        error: {
          'status': 562,
          'stack': '아이디나 비밀번호가 일치하지 않습니다.'
        },
        message: '아이디나 비밀번호가 일치하지 않습니다.'
      }));
    }

    // 일치하는 아이디와 비밀번호가 있을 경우
    // 세션에 유저 정보를 저장하고 메인 페이지로 redirect
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