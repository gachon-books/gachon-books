const bcrypt = require('bcrypt');
const express = require('express');
const passport = require('passport');
const User = require('../schemas/user');
const session = require('express-session');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

router.get('/', isLoggedIn, function(req, res, next) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
