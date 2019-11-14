const fs = require('fs');
const ejs = require('ejs');
var express = require('express');
var User = require('../schemas/user');
var session = require('express-session');
var router = express.Router();

router.post('/', async function(req, res, next) {
  let userid = req.body.updateid;
  let userpw = req.body.updatepw;
  let username = req.body.updatename;
  let userlocation = req.body.updatelocation;
  console.log(`userid: ${userid}, userpw: ${userpw}, username: ${username}, userlocation: ${userlocation}`);

  try {
    await User.updateOne(
      { id: userid },
      { password: userpw, name: username, address: userlocation }
    );
    console.log(`${username}님의 정보가 수정되었습니다.`);

    req.session.auth = 99;
    req.session.uid = userid;
    req.session.name = username;
    req.session.address = userlocation;
    // req.session.favorite = [];

    res.redirect('/');
  } catch(error) {
    console.error(error);
    next(error);
  };
});

module.exports = router;
