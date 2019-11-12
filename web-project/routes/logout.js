var express = require('express');
var session = require('express-session');
var router = express.Router();

router.post('/', function(req, res, next) {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
