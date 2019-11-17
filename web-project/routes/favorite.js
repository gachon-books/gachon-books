const fs = require('fs');
const ejs = require('ejs');
const express = require('express');
const User = require('../schemas/user');
const session = require('express-session');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

/*
  [즐겨찾기 추가] /favorite/add (POST)
  1 놀이시설 상세정보에서 '즐겨찾기 등록' 버튼을 누르면 진입합니다.
  2 로그인된 상태가 아닐 경우 에러 페이지로 보냅니다.
    로그인 상태일 경우 로그인한 유저의 줄겨찾기 리스트에 선택한 놀이시설 정보를 DB에 추가($push)합니다.
  3 세션에도 변경된 내용을 업데이트한 후 메인 페이지로 보냅니다.
*/
router.post('/add', isLoggedIn, async function(req, res, next) {
  // 로그인 한 유저의 id와 선택한 놀이시설의 정보를 가져옴
  let uid = req.body.favUid;
  let favNo = req.body.favNo;
  let favCityName = req.body.favCityName;
  let favName = req.body.favName;
  let favAddr = req.body.favAddr;

  try {
    // 해당 유저의 favorite array에 해당 놀이시설을 추가
    await User.updateOne(
        { id: uid },
        { $push: { favorite: { no: favNo, cityName: favCityName, name: favName, addr: favAddr } } }
    );
    console.log(`즐겨찾기가 추가되었습니다.`);

    // 해당 유저의 정보를 찾아 세션 정보를 업데이트
    let users = await User.findOne(
        { id: uid },
        { _id: 0, favorite: 1 }
    );
    req.session.user.favorite = users._doc.favorite;
    
    // 메인 페이지로 redirect
    res.redirect('/');
  }
  catch (Error) {
    console.error(error);
    next(error);
  }
});

/*
  [즐겨찾기 제거] /favorite/delete (POST)
  1 즐겨찾기한 놀이시설 목록에서 각 목록의 오른쪽에 위치한 쓰레기통 아이콘을 클릭하면 진입합니다.
  2 로그인된 상태가 아닐 경우 에러 페이지로 보냅니다.
    로그인 상태일 경우 유저의 줄겨찾기 리스트에서 선택한 놀이시설 정보를 DB에서 제거($pull)합니다.
  3 세션에도 변경된 내용을 업데이트한 후 메인 페이지로 보냅니다.
*/
router.post('/delete', isLoggedIn, async function(req, res, next) {
  // 로그인 한 유저의 id와 선택한 놀이시설의 번호를 가져옴
  let uid = req.body.favUid;
  let favNo = req.body.favNo;
  console.log(favNo);

  try {
    // 해당 유저의 favorite array에서 이 놀이시설을 제거
    await User.updateOne(
        { id: uid },
        { $pull: { favorite: { no: favNo } } }
    );
    console.log(`즐겨찾기가 제거되었습니다.`);

    // 해당 유저의 정보를 찾아 세션 정보를 업데이트
    let users = await User.findOne(
        { id: uid },
        { _id: 0, favorite: 1 }
    );
    req.session.user.favorite = users._doc.favorite;

    // 메인 페이지로 redirect
    res.redirect('/');
  }
  catch (Error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
