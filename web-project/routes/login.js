const fs = require('fs');
const ejs = require('ejs');
var express = require('express');
var User = require('../schemas/user');
var session = require('express-session');
var router = express.Router();

router.post('/', async function(req, res, next) {
  let userid = req.body.loginid;
  let userpw = req.body.loginpw;
  // console.log(`userid: ${userid}, userpw: ${userpw}`);

  try {
    let users = await User.findOne(
      { id: userid, password: userpw },
      { _id: 0, id: 1, name: 1, address: 1 }
    );

    if(users === null) {
      let htmlstream = fs.readFileSync(__dirname + '/../views/error.ejs','utf8');

      res.end(ejs.render(htmlstream, {
        error: {
          'status': 562,
          'stack': '아이디 혹은 비밀번호가 일치하지 않습니다.'
        },
        message: '아이디 혹은 비밀번호가 일치하지 않습니다.'
      }));
    }
    else {
      req.session.auth = 99;
      req.session.uid = users._doc.id;
      req.session.name = users._doc.name;
      req.session.address = users._doc.address;
      // req.session.favorite = [];

      res.redirect('/');
    }
  } catch(error) {
    console.error(error);
    next(error);
  };
});

module.exports = router;
