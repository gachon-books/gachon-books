const fs = require('fs');
const ejs = require('ejs');

/*
  로그인 상태인지 판단하는 미들웨어입니다.
  로그인 되지 않은 상태라면 에러 페이지로 보냅니다.
*/
exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    }
    else {
        let htmlstream = fs.readFileSync(__dirname + '/../views/error.ejs','utf8');

        res.end(ejs.render(htmlstream, {
          error: {
            'status': 562,
            'stack': '로그인 후 이용해주세요'
          },
          message: '로그인 후 이용해주세요'
        }));
    }
};

/*
  로그인되지 않은 상태인지 판단하는 미들웨어입니다.
  로그인된 상태라면 에러 페이지로 보냅니다.
*/
exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        next();
    }
    else {
        let htmlstream = fs.readFileSync(__dirname + '/../views/error.ejs','utf8');

        res.end(ejs.render(htmlstream, {
          error: {
            'status': 562,
            'stack': '로그아웃 후 이용해주세요'
          },
          message: '로그아웃 후 이용해주세요'
        }));
    }
};