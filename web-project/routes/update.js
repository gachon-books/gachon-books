const fs = require('fs');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const express = require('express');
const User = require('../schemas/user');
const session = require('express-session');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

/*
  [회원정보수정] /update (POST)
  1 메인 페이지에서 navbar의 '<%= 회원이름 %>' 버튼을 클릭하여 진입합니다.
  2 입력된 비밀번호는 암호화합니다.
  3 입력된 아이디를 DB에서 검색하여 수정 입력된 정보와 암호화된 비밀번호를 저장(수정)합니다.
  4 세션에도 유저 정보를 갱신하고 메인 페이지로 보냅니다.
*/
router.post('/', isLoggedIn, async function(req, res, next) {
  // 회원정보수정 폼에서 입력(수정)된 정보를 가져옴
  let userid = req.body.updateid;
  let userpw = req.body.updatepw;
  let username = req.body.updatename;
  let userlocation = req.body.updatelocation;
  console.log(`userid: ${userid}, userpw: ${userpw}, username: ${username}, userlocation: ${userlocation}`);

  try {
    // 비밀번호 암호화
    let hash = await bcrypt.hash(userpw, 12);

    // DB에 해당 유저의 정보 수정
    await User.updateOne(
      { id: userid },
      { password: hash, name: username, address: userlocation }
    );
    console.log(`${username}님의 정보가 수정되었습니다.`);

    // 세션에 저장된 유저 정보를 갱신
    req.session.user.password = hash;
    req.session.user.name = username;
    req.session.user.address = userlocation;

    // 메인 페이지로 redirect
    res.redirect('/');
  }
  catch(error) {
    console.error(error);
    next(error);
  };
});

module.exports = router;
