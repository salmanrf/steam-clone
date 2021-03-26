const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const {body, validationResult} = require("express-validator");
const path = require("path");
const fs = require("fs/promises");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../public/user/temp"),
  filename: (req, file, cb) => {
    if(file.fieldname === "profilepic") {
      cb(null, "profile-picture.jpg");
    }
  }
});

const upload = multer({storage});

const mongoose = require("mongoose");

const nconf = require("nconf");
nconf.file(path.join(__dirname, "../config.json"));

const userDB = mongoose.createConnection(nconf.get("USER_DB"), {useNewUrlParser: true, useUnifiedTopology: true});
userDB.on('error', console.error.bind(console, 'MongoDB connection error:'));
const User = userDB.model("User", require("../models/user"));

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({username}, (err, user) => {
      if(err)
        return done(err);

      if(!user) return done(null, false, {message: "Username not found"});

      bcrypt.compare(password, user.password)
        .then(correct => {
          if(correct)
            return done(null, user);
          else 
            return done(null, false, {message: "Incorrect password"});
        })
    });
  })
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});

exports.login_get = (req, res, next) => {
  const errmsg = req.flash();
  const errors = {username: {}, password: {}};

  if(errmsg && errmsg.error) {
    if(errmsg.error[0].includes("password")) {
      errors.password.msg = errmsg.error[0];
    } else if(errmsg.error[0].includes("Username")) {
      errors.username.msg = errmsg.error[0];
    }
  }

  res.render("login_form", {title: "Login", action: "/login", errors});
}

exports.login_post = [
  body("username").trim().isLength({min: 1}).withMessage("Username can't be empty").escape(),
  body("password").trim().isLength({min: 1}).withMessage("Password can't be empty").escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      res.render("login_form", {title: "Login", action: "/login", errors: errors.mapped()});
    } else {
      next();
    }
  },

  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
]

exports.signup_get = (req, res, next) => {
  res.render("signup_form", {title: "Signup", action: "/signup"});
}

exports.signup_post = [
  upload.single("profilepic"),

  body("username").trim().isLength({min: 1, max: 100}).withMessage("Must contain 1 - 100 characters").escape(),
  body("password").trim().isLength({min: 1, max: 100}).withMessage("Must contain 1 - 100 characters").escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      res.render("signup_form", {title: "Signup", action: "/signup", errors: errors.mapped()});
    } else {
      (async () => {
        try {
          const registeredUser = await User.findOne({username: req.body.username});
        
          if(registeredUser) {
            const errors = {username: {msg: "username is already taken"}};
            return res.render("signup_form", {title: "Signup", action: "/signup", errors});
          }

          const hashedPwd = await bcrypt.hash(req.body.password, 10);

          const user = new User({
            username: req.body.username,
            password: hashedPwd
          });

          const newuser = await user.save();

          const userdir =  await fs.mkdir(path.join(__dirname, `../public/user/${newuser._id}/`), {recursive: true});
          await fs.rename(req.file.path, `${userdir}/${req.file.filename}`);

          res.redirect("/login");
        } catch(err) {
            return next(err);
        }
      })();
    }
  },
]

exports.userModel = User;
exports.passport = passport;
