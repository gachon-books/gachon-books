var fs = require('fs');
var ejs = require('ejs');
var express = require('express');
var User = require('../schemas/user');
var router = express.Router();

router.post('/', async function(req, res, next) {
  let userid = req.body.signupid;
  let userpw = req.body.signuppw;
  let username = req.body.signupname;
  let userlocation = req.body.signuplocation;
  console.log(`userid: ${userid}, userpw: ${userpw}, username: ${username}, userlocation: ${userlocation}`);

  try {
    let users = await User.findOne(
      { id: userid },
      { _id: 0, id: 1 }
    );

    if(users === null) {
      let user = new User({
        id: userid,
        password: userpw,
        name: username,
        address: userlocation
      });

      await user.save();
      console.log(`${username}님이 가입되었습니다.`);

      res.redirect('/');
    }
    else {
      let htmlstream = fs.readFileSync(__dirname + '/../views/error.ejs','utf8');

      res.end(ejs.render(htmlstream, {
        error: {
          'status': 562,
          'stack': '이미 존재하는 아이디입니다.'
        },
        message: '이미 존재하는 아이디입니다.'
      }));
    }
  } catch(error) {
    console.error(error);
    next(error);
  };

  res.redirect('/');
});

module.exports = router;
