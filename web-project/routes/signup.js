const fs = require('fs');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const express = require('express');
const passport = require('passport');
const User = require('../schemas/user');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

router.post('/', isNotLoggedIn, async function(req, res, next) {
  let userid = req.body.signupid;
  let userpw = req.body.signuppw;
  let username = req.body.signupname;
  let userlocation = req.body.signuplocation;

  try {
    // 입력된 아이디가 이미 있는 아이디인지 중복 검사
    let users = await User.findOne(
      { id: userid },
      { _id: 0, id: 1 }
    );

    // 이미 존재하는 아이디일 경우 에러페이지로 리다이렉션
    if(users) {
      let htmlstream = fs.readFileSync(__dirname + '/../views/error.ejs','utf8');

      res.end(ejs.render(htmlstream, {
        error: {
          'status': 562,
          'stack': '이미 존재하는 아이디입니다.'
        },
        message: '이미 존재하는 아이디입니다.'
      }));
    }
    
    let hash = await bcrypt.hash(userpw, 12);

    // 유저 생성
    let user = new User({
      id: userid,
      password: hash,
      name: username,
      address: userlocation
    });

    await user.save();
    console.log(`${username}님이 가입되었습니다.`);

    // 메인페이지로 복귀
    res.redirect('/');
  }
  catch(error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
