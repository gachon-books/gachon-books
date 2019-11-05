var express = require('express');
var session = require('express-session');
var mongoclient = require('mongodb').MongoClient;
var router = express.Router();

var url = "mongodb://localhost:27017/";

router.post('/', function(req, res, next) {

  let body = req.body;
  console.log(`id: ${body.loginid} / pw: ${body.loginpw}`);

  mongoclient.connect(url, function(err, database) {
    if (err) throw err;
    var query = { id: body.loginid, password: body.loginpw };
    var cursor = database.db("local").collection("users").find(query);
    cursor.each(function(err, doc) {
      if (err) throw err;
      if (doc != null) {  // 로그인 성공
        console.log(doc);
      }
    });
    database.close();
  });

  // 오류!
  if(name) {
    res.redirect('/');
  }
  else
    res.send('오류!!');
});

module.exports = router;
