const fs = require('fs');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const express = require('express');
const User = require('../schemas/user');
const session = require('express-session');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

router.post('/', isLoggedIn, async function(req, res, next) {
  let userid = req.body.updateid;
  let userpw = req.body.updatepw;
  let username = req.body.updatename;
  let userlocation = req.body.updatelocation;
  console.log(`userid: ${userid}, userpw: ${userpw}, username: ${username}, userlocation: ${userlocation}`);

  try {
    let hash = await bcrypt.hash(userpw, 12);  // 암호화

    await User.updateOne(
      { id: userid },
      { password: hash, name: username, address: userlocation }
    );
    console.log(`${username}님의 정보가 수정되었습니다.`);

    req.session.user.password = hash;
    req.session.user.name = username;
    req.session.user.address = userlocation;

    res.redirect('/');
  }
  catch(error) {
    console.error(error);
    next(error);
  };
});

module.exports = router;
