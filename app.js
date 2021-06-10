const createError = require('http-errors');
const express = require('express');
const path = require('path');
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require('mongoose');
const nconf = require("nconf");
const compression = require("compression");

nconf.file(path.join(__dirname, "config.json"));

const app = express();

const storeRouter = require("./routes/router");

// Get authentication setup
const {passport} = require("./controllers/user_controller");

// Setup default mongoose connection
const gameDB = nconf.get("GAME_DB");
mongoose.connect(gameDB, { useNewUrlParser: true , useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Session setup for authentication (passportjs)
app.use(session({secret: nconf.get("secrets"), resave: false, saveUninitialized: true, cookie: {sameSite: true, maxAge: 6000000}}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(compression());

app.use('/', storeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;