const fs = require('fs');
const ejs = require('ejs');
var express = require('express');
var User = require('../schemas/user');
var session = require('express-session');
var router = express.Router();

router.post('/add', async function(req, res, next) {
  let uid = req.body.favUid;
  if(uid == '') {
    let htmlstream = fs.readFileSync(__dirname + '/../views/error.ejs','utf8');

    res.end(ejs.render(htmlstream, {
      error: {
        'status': 562,
        'stack': '로그인 후 이용해주세요'
      },
      message: '로그인 후 이용해주세요'
    }));
  }

  let favNo = req.body.favNo;
  let favCityName = req.body.favCityName;
  let favName = req.body.favName;
  let favAddr = req.body.favAddr;

  try {
    await User.updateOne(
        { id: uid },
        { $push: { favorite: { no: favNo, cityName: favCityName, name: favName, addr: favAddr } } }
    );
    console.log(`즐겨찾기가 추가되었습니다.`);

    let users = await User.findOne(
        { id: uid },
        { _id: 0, favorite: 1 }
    );
    req.session.favorite = users._doc.favorite;
    res.redirect('/');
  }
  catch (Error) {
    console.error(error);
    next(error);
  }
});

router.post('/delete', async function(req, res, next) {
    let uid = req.body.favUid;
    let favNo = req.body.favNo;
    console.log(favNo);

    try {
        await User.updateOne(
            { id: uid },
            { $pull: { favorite: { no: favNo } } }
        );
        console.log(`즐겨찾기가 제거되었습니다.`);

        let users = await User.findOne(
            { id: uid },
            { _id: 0, favorite: 1 }
        );
        req.session.favorite = users._doc.favorite;
        res.redirect('/');
      }
      catch (Error) {
        console.error(error);
        next(error);
      }
});

module.exports = router;
