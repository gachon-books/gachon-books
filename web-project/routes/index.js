var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '어린이 놀이시설 정보' });
});

module.exports = router;
