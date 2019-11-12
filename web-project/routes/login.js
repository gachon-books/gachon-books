var express = require('express');
var User = require('../schemas/user');
var session = require('express-session');
var router = express.Router();

router.post('/', async function(req, res, next) {
  let userid = req.body.loginid;
  let userpw = req.body.loginpw;
  console.log(`userid: ${userid}, userpw: ${userpw}`);

  try {
    let users = await User.findOne(
      { id: userid, password: userpw },
      { _id: 0, id: 1, password: 1, name: 1 }
    );

    if(users == '') {
      res.send('일치하는 아이디나 비밀번호가 없습니다.');
      // 이 부분 추후에 구현
    }
    else {
      req.session.auth = 99;
      req.session.name = users._doc.name;
      // req.session.favorite = [];

      res.redirect('/');
    }
  } catch(error) {
    console.error(err);
    next(err);
  };
});

module.exports = router;
