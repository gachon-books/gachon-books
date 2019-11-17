const fs = require('fs');
const ejs = require('ejs');

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

exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        next();
    }
    else {
        res.redirect('/');
    }
};