const async = require("async");
const {body, validationResult} = require("express-validator");

const Publisher = require('../models/publisher');
const Genre = require('../models/genre');
const Game = require('../models/game');

exports.publisher_list = (req, res, next) => {
  async.parallel({
    publishers: (callback) => Publisher.find().exec(callback),
    genres: (callback) => Genre.find().exec(callback)
  }, (err, {publishers, genres}) => {
    if(err) return next(err);

    res.render("publisher_list", {title: "Browse Publishers", publishers, genres, user: req.user});
  })
}

exports.publisher_detail = (req, res, next) => {
  async.parallel({
    publisher: (callback) => Publisher.findById(req.params.id).exec(callback),
    games: (callback) => Game.find({publisher: req.params.id}).populate("genres").exec(callback),
    genres: (callback) => Genre.find().exec(callback)
  }, (err, {publisher, games, genres}) => {
    if(err) return next(err);

    res.render("publisher_detail", {title: `Published By ${publisher.name}`, publisher, games, genres, user: req.user});
  });
}

exports.publisher_create_get = (req, res, next) => {
  res.render("publisher_form", {title: "Create Publisher", user: req.user});
}

exports.publisher_create_post = [
  body("name").trim().isLength({min: 1, max: 100}).withMessage("Must contain 1 - 100 characters").escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const publisher = new Publisher({
      name: req.body.name
    });

    if(!errors.isEmpty()) {
      res.render("publisher_form", {title: "Create Publisher", publisher, errors: errors.mapped(), user: req.user});
    } else {
      Publisher.findOne({name: publisher.name}).then(p => {
        if(!p) {
          publisher.save()
            .then(publ => res.redirect(publ.url))
            .catch(err => next(err));
        } else {
          const errors = {name: {msg: "Publisher with this name already exists"}};
          res.render("publisher_form", {title: "Create Publisher", publisher, errors, user: req.user});
        }
      }).catch(err => next(err));
    }
  }
]

exports.publisher_delete_get = (req, res, next) => {
  Publisher.findById(req.params.id)
    .then(publisher => {
      res.render("publisher_delete", {publisher, user: req.user})
    })
    .catch(err => next(err));
}

exports.publisher_delete_post = (req, res, next) => {
  Publisher.findByIdAndDelete(req.body.id)
  .then(() => {
    res.redirect("/publisher");
  })
  .catch(err => next(err));
}

exports.publisher_update_get = (req, res, next) => {
  Publisher.findById(req.params.id)
    .then(publisher => {
      res.render("publisher_form", {title: "Update Publisher", publisher, user: req.user});
    })
    .catch(err => next(err));
}

exports.publisher_update_post = [
  body("name").trim().isLength({min: 1, max: 100}).withMessage("Must contain 1 - 100 characters").escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    // console.log(req.body);

    const publisher = new Publisher({
      _id: req.body.id,
      name: req.body.name
    });


    // console.log(publisher);
    if(!errors.isEmpty()) {
      res.render("publisher_form", {title: "Update Publisher", errors: errors.mapped(), user: req.user});
    } else {
      Publisher.findOne({name: publisher.name}).then(g => {
        if(!g) {
          Publisher.findByIdAndUpdate(req.body.id, publisher, {new: true})
            .then(publ => res.redirect(publ.url))
            .catch(err => next(err));
        } else {
          const errors = {name: {msg: "Publisher with this name already exists"}};
          res.render("publisher_form", {title: "Update Publisher", publisher, errors, user: req.user});
        }
      }).catch(err => next(err));
    }
  }
]
