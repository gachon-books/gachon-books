var express = require('express');
var mongoclient = require('mongodb').MongoClient;
var router = express.Router();

var url = "mongodb://localhost:27017/";

router.post('/', function(req, res, next) {
  let body = req.body;
  console.log(`id: ${body.signupid} / pw1: ${body.signuppw} / pw2: ${body.signuppw2}`);
  console.log(`name: ${body.signupname} / location: ${body.signuplocation}`);

  mongoclient.connect(url, function(err, database) {
    if (err) throw err;
    var dbo = database.db("local");
    var myobj = { id: body.signupid, password: body.signuppw, name: body.signupname, location: body.signuplocation };
    dbo.collection("users").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted!!");
      // alert로 회원가입이 완료되었습니다. 메시지 출력해야 함
      database.close();
    });
  });

  res.redirect('/');
});

module.exports = router;
