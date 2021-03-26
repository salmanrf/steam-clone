const async = require("async");
const {body, validationResult} = require("express-validator");

const Developer = require('../models/developer');
const Game = require('../models/game');
const Genre = require('../models/genre');

exports.developer_list = (req, res, next) => {
  async.parallel({
    developers: (callback) => Developer.find().exec(callback),
    genres: (callback) => Genre.find().exec(callback)
  }, (err, {developers, genres}) => {
    if(err) return next(err);

    res.render("developer_list", {title: "Browse Developers", developers, genres, user: req.user});
  })
}

exports.developer_detail = (req, res, next) => {
  async.parallel({
    developer: (callback) => Developer.findById(req.params.id).exec(callback),
    games: (callback) => Game.find({developer: req.params.id}).populate("genres").exec(callback),
    genres: (callback) => Genre.find().exec(callback)
  }, (err, {developer, games, genres}) => {
    if(err) return next(err);

    res.render("developer_detail", {title: `Developed By ${developer.name}`, developer, games, genres, user: req.user});
  });
}

exports.developer_create_get = (req, res, next) => {
  res.render("developer_form", {title: "Create Developer", user: req.user});
}

exports.developer_create_post = [
  body("name").trim().isLength({min: 1, max: 100}).withMessage("Must contain 1 - 100 characters").escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const developer = new Developer({
      name: req.body.name
    });

    if(!errors.isEmpty()) {
      res.render("developer_form", {title: "Create Developer", developer, errors: errors.mapped(), user: req.user});
    } else {
      Developer.findOne({name: developer.name}).then(d => {
        if(!d) {
          developer.save()
            .then(dev => res.redirect(dev.url))
            .catch(err => next(err));
        } else {
          const errors = {name: {msg: "Developer with this name already exists"}};
          res.render("developer_form", {title: "Create Developer", developer, errors, user: req.user});
        }
      }).catch(err => next(err));
    }
  }
]

exports.developer_delete_get = (req, res, next) => {
  Developer.findById(req.params.id)
    .then(developer => {
      res.render("developer_delete", {developer, user: req.user});
    })
    .catch(err => next(err));
}

exports.developer_delete_post = (req, res, next) => {
  Developer.findByIdAndDelete(req.body.id)
  .then(() => {
    res.redirect("/developer");
  })
  .catch(err => next(err));
}

exports.developer_update_get = (req, res, next) => {
  Developer.findById(req.params.id)
    .then(developer => {
      res.render("developer_form", {title: "Update Developer", developer, user: req.user});
    })
    .catch(err => next(err));
}

exports.developer_update_post = [
  body("name").trim().isLength({min: 1, max: 100}).withMessage("Must contain 1 - 100 characters").escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const developer = new Developer({
      _id: req.body.id,
      name: req.body.name
    });

    if(!errors.isEmpty()) {
      res.render("developer_form", {title: "Update Developer", errors: errors.mapped(), user: req.user});
    } else {
      Developer.findOne({name: developer.name}).then(g => {
        if(!g) {
          Developer.findByIdAndUpdate(req.body.id, developer, {new: true})
            .then(dev => res.redirect(dev.url))
            .catch(err => next(err));
        } else {
          const errors = {name: {msg: "Developer with this name already exists"}};
          res.render("developer_form", {title: "Update Developer", developer, errors, user: req.user});
        }
      }).catch(err => next(err));
    }
  }
]
