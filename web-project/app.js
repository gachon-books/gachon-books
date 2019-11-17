const path = require('path');
const logger = require('morgan');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const signupRouter = require('./routes/signup');
const updateRouter = require('./routes/update');
const favoriteRouter = require('./routes/favorite');
const connect = require('./schemas/database');
const passportConfig = require('./passport');

const app = express();
connect();                 // mongodb 연결
passportConfig(passport);  // passport 설정

// ejs 템플릿 엔진 사용
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser('secret code'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/bootstrap/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/bootstrap/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(session({
  secret: 'secret code',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// passport 설정
app.use(passport.initialize());
app.use(passport.session());

// routes 연결
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/signup', signupRouter);
app.use('/update', updateRouter);
app.use('/favorite', favoriteRouter);

// 404 에러 핸들러
app.use(function(req, res, next) {
  next(createError(404));
});

// 에러 핸들러
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
