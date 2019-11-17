const fs = require('fs');
const ejs = require('ejs');
const express = require('express');
const User = require('../schemas/user');
const session = require('express-session');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

router.post('/add', isLoggedIn, async function(req, res, next) {
  let uid = req.body.favUid;
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
    req.session.user.favorite = users._doc.favorite;
    res.redirect('/');
  }
  catch (Error) {
    console.error(error);
    next(error);
  }
});

router.post('/delete', isLoggedIn, async function(req, res, next) {
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
        req.session.user.favorite = users._doc.favorite;
        res.redirect('/');
      }
      catch (Error) {
        console.error(error);
        next(error);
      }
});

module.exports = router;
