var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
var postsRouter = require('./routes/posts');
var fileRouter = require('./routes/file');
var commentsRouter = require('./routes/comments');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  bodyParser.json({
    type: 'application/*+json',
  }),
);

// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: false,
    type: 'application/x-www-form-urlencoded',
  }),
);

app.use('/', indexRouter);
app.use('/file', fileRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err);

  // render the error page
  if (err.message == 'Not Found') {
    res.status(err.status || 404);
    res.render('404');
  } else {
    res.status(err.status || 500);
    res.render('500');
  }
});

app.get('*', function(req, res) {
  res.render('404');
});

module.exports = app;
