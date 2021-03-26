const path = require("path");
const {body, validationResult} = require("express-validator");
const mongoose = require("mongoose");

const nconf = require("nconf");
nconf.file(path.join(__dirname, "../config.json"));

const forumDB = mongoose.createConnection(nconf.get("FORUM_DB"), {useNewUrlParser: true, useUnifiedTopology: true});
forumDB.on('error', console.error.bind(console, 'MongoDB connection error:'));
const Forum = forumDB.model("Forum", require("../models/forum"));

const {userModel} = require("./user_controller");

exports.forum_index = (req, res, next) => {
  Forum.find()
    .populate("author", {}, userModel)
    .exec((err, forums) => {
      if(err) return next(err);

      res.render("forum_index", {title: "Forum", user: req.user, forums});
  });
}

exports.create_forum_post = [
  body("title").trim().isLength({min: 1, max: 100}).withMessage("Must contain 1 - 100 characters").escape(),
  body("content").trim().isLength({min: 1, max: 500}).withMessage("Must contain 1 - 500 characters").escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const forum = new Forum({
      title: req.body.title,
      content: req.body.content,
      author: req.user._id
    });

    if(!errors.isEmpty()) {
      res.render("forum_index", {title: "Forum", user: req.user, error: "Fill all required fields", forum});
    } else {
      forum.save().then(() => res.redirect("/forum"));
    }
  }
]

exports.post_detail = (req, res, next) => {
  Forum.findById(req.params.id)
    .populate("author", {}, userModel)
    .exec((err, post) => {
      if(err) return next(err);
  
      res.render("forum_post", {title: post.title, post, user: req.user});
    });
}