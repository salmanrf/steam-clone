const async = require("async");
const {body, validationResult} = require("express-validator");

const Game = require('../models/game');
const Genre = require('../models/genre');

exports.genre_list = (req, res, next) => {
  Genre.find({}, (err, genres) => {
    if(err) return next(err);

    res.render("genre_list", {title: "Browse Genres", genres, user: req.user});
  })
}

exports.genre_detail = (req, res, next) => {
  async.waterfall([
    (callback) => {
      Genre.find().then(genres => {
        callback(null, genres);
      }).catch(err => next(err));
    },
    (genres, callback) => {
      const reqGenre = genres.filter(g => g.name === req.params.name)[0];
      callback(null, reqGenre, genres)
    },
    (reqGenre, genres, callback) => {
      Game.find({genres: reqGenre}).populate("genres").then(games => {
        callback(null, {games, reqGenre, genres});
      }).catch(err => next(err));
    }
  ], (err, {games, reqGenre, genres}) => {
    if(err) return next(err);
    res.render('genre_detail', {title: `Browse ${req.params.name}`, games, reqGenre, genres, user: req.user});
  })
}

exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", {title: "Create Genre"});
}

exports.genre_create_post = [
  body("name").trim().isLength({min: 1, max: 100}).withMessage("Must contain 1 - 100 characters").escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({
      name: req.body.name
    });

    if(!errors.isEmpty()) {
      res.render("genre_form", {title: "Create Genre", genre, errors: errors.mapped()});
    } else {
      Genre.findOne({name: genre.name}).then(g => {
        if(!g) {
          genre.save()
            .then(genre => res.redirect(genre.url))
            .catch(err => next(err));
        } else {
          const errors = {name: {msg: "Genre with this name already exists"}};
          res.render("genre_form", {title: "Create Genre", genre, errors, user: req.user});
        }
      }).catch(err => next(err));
    }
  }
]

exports.genre_delete_get = (req, res, next) => {
  Genre.findById(req.params.id)
    .then(genre => {
      res.render("genre_delete", {genre, user: req.user});
    })
    .catch(err => next(err));
}

exports.genre_delete_post = (req, res, next) => {
  Genre.findByIdAndDelete(req.params.id)
    .then(() => {
      res.redirect("/genre");
    })
    .catch(err => next(err));
}

exports.genre_update_get = (req, res, next) => {
  Genre.findById(req.params.id)
    .then(genre => {
      res.render("genre_form", {title: "Update Genre", genre});
    })
    .catch(err => next(err));
}

exports.genre_update_post = [
  body("name").trim().isLength({min: 1, max: 100}).withMessage("Must contain 1 - 100 characters").escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({
      _id: req.body.id,
      name: req.body.name
    });

    if(!errors.isEmpty()) {
      res.render("genre_form", {title: "Update Genre", genre, errors: errors.mapped(), user: req.user});
    } else {
      Genre.findOne({name: genre.name}).then(g => {
        if(!g) {
          Genre.findByIdAndUpdate(req.body.id, genre, {new: true})
            .then(genre => res.redirect(genre.url))
            .catch(err => next(err));
        } else {
          const errors = {name: {msg: "Genre with this name already exists"}};
          res.render("genre_form", {title: "Update Genre", genre, errors, user: req.user});
        }
      }).catch(err => next(err));
    }
  } 
]
