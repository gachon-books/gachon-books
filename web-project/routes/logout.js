const bcrypt = require('bcrypt');
const express = require('express');
const passport = require('passport');
const User = require('../schemas/user');
const session = require('express-session');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

/*
  [로그아웃] /logout (GET)
  1 메인 페이지에서 navbar의 'logout' 버튼을 클릭하면 진입합니다.
  2 로그아웃 및 세션 제거 후 메인 페이지로 보냅니다.
*/
router.get('/', isLoggedIn, function(req, res, next) {
  // 로그아웃 및 세션 제거
  req.logout();
  req.session.destroy();

  // 메인 페이지로 redirect
  res.redirect('/');
});

module.exports = router;
