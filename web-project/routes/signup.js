const fs = require('fs');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const express = require('express');
const passport = require('passport');
const User = require('../schemas/user');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

/*
  [회원가입] /signup (POST)
  1 로그인 모달 창의 '회원가입' 버튼을 클릭하여 진입합니다.
  2 입력된 아이디를 DB에서 검색하여 중복된 아이디일 경우 에러 페이지로 보냅니다.
  3 중복되지 않았다면, 비밀번호를 암호화한 후 DB에 추가한 후 메인 페이지로 보냅니다.
*/
router.post('/', isNotLoggedIn, async function(req, res, next) {
  // 회원가입 모달에 작성된 내용을 가져옴
  let userid = req.body.signupid;
  let userpw = req.body.signuppw;
  let username = req.body.signupname;
  let userlocation = req.body.signuplocation;

  try {
    // 아이디 중복 검사
    let users = await User.findOne(
      { id: userid },
      { _id: 0, id: 1 }
    );

    // 아이디가 중복됐을 경우 에러 페이지로 redirect
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
    
    // 비밀번호 암호화
    let hash = await bcrypt.hash(userpw, 12);

    // DB에 유저 추가
    let user = new User({
      id: userid,
      password: hash,
      name: username,
      address: userlocation
    });

    await user.save();
    console.log(`${username}님이 가입되었습니다.`);

    // 메인 페이지로 redirect
    res.redirect('/');
  }
  catch(error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
