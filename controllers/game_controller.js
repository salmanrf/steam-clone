const async = require('async');
const fs = require('fs/promises');
const {body, validationResult} = require('express-validator');
const path = require('path');
const multer = require('multer'); 

const Game = require('../models/game');
const Genre = require('../models/genre');
const Developer = require('../models/developer');
const Publisher = require('../models/publisher');

exports.game_list = (req, res, next) => {
  async.parallel({
    games: (callback) => Game.find({}).populate('genres').exec(callback),
    genres: (callback) => Genre.find({}, callback),
    developers: (callback) => Developer.find({}, callback),
    publishers: (callback) => Publisher.find({}, callback)
  }, (err, {games, genres, developers, publishers}) => {
    if(err) return next(err);

    const featured = randomize(games);
    const specials = randomize(games);
    const tabcontents = randomize(games);

    // res.render('index', {title: 'Welcome to Steam', games, genres});
    res.render('index', {title: 'Welcome to Steam', featured, specials, tabcontents, genres, developers, publishers, user: req.user});
  });
}

exports.gamestore_dashboard = (req, res, next) => {
  if(!((req.user && req.user.level) && req.user.level >= 3)) {
    const error = new Error();
    error.status = 404;
    return next(error);
  }

  async.parallel({
    games: (callback) => Game.estimatedDocumentCount(callback),
    genres: (callback) => Genre.find({}, callback),
    developers: (callback) => Developer.estimatedDocumentCount(callback),
    publishers: (callback) => Publisher.estimatedDocumentCount(callback),
  }, (err, {games, genres, developers, publishers}) => {
    if(err) return next(err);
    res.render('dashboard', {title: 'Dashboard', games, genres, developers, publishers, user: req.user});
  });
}

exports.game_detail = (req, res, next) => {
  async.parallel({
    game: (callback) => {
      Game.findById(req.params.id)
        .populate('genres')
        .populate('developer')
        .populate('publisher')
        .exec(callback)
    },
    genres: (callback) => Genre.find({}, callback),
    gameFiles: (callback) => {
      (async () => {
        const gamePath = path.join(__dirname, `../public/images/games/${req.params.id}/`); 

        try {
          const files = await fs.readdir(gamePath);
          callback(null, files);
        } catch(err) {
          callback(err);
        }
      })();
    }
  }, (err, {game, genres, gameFiles}) => {
      if(err) return next(err);

      const screenshots = gameFiles.filter(file => file.indexOf("ss") > -1);

      res.render('game_detail', {title: game.title, game, genres, screenshots, user: req.user});
  });
}

exports.game_create_get = (req, res, next) => {
  if(!((req.user && req.user.level) && req.user.level >= 3)) {
    const error = new Error();
    error.status = 404;
    return next(error);
  }

  async.parallel({
    genres: (callback) => Genre.find({}, callback),
    developers: (callback) => Developer.find({}, callback),
    publishers: (callback) => Publisher.find({}, callback),
  }, (err, {genres, developers, publishers}) => {
    if(err) return next(err);

    res.render("game_form", {title: "Create Game", genres, developers, publishers, user: req.user});
  });
}

const storage = multer.diskStorage({
  destination: path.join(__dirname, `../public/images/games/temp/`),
  filename: (req, file, cb) => {
    if(file.fieldname === "cover") {
      cb(null, `main.jpg`);  
    } else if(file.fieldname === "screenshots") {
        if(!req.count)
          req.count = 1;

        cb(null, `ss-${req.count++}.jpg`);
    }
  }
});

const upload = multer({storage});

exports.game_create_post = [
  (req, res, next) => {

    if(!((req.user && req.user.level) && req.user.level >= 3)) {
      const error = new Error();
      error.status = 404;
      return next(error);
    }
    next();
  },

  upload.fields([{name: "cover", maxCount: 1}, {name: "screenshots", maxCount: 10}]),

  // replace undefined (empty) with an empty array
  (req, res, next) => {
    // genres will be an array only if more than one genres are selected
    if(!(req.body.genres instanceof Array)) {
        if(!req.body.genres)
            req.body.genres = [];
        else {
          req.body.genres = [req.body.genres];
        }        
    }
    next();
  },

  body("title").trim().isLength({min: 1, max: 100}).withMessage("Must contain 1 - 100 characters").escape(),
  body("summary").trim().isLength({min: 1, max: 500}).withMessage("Must contain 1 - 500 characters").escape(),
  body("release").trim().isDate().withMessage("Invalid date input").escape(),
  body("price").trim().isInt({min: 0}).withMessage("Must be an integer, min: 0").escape(),
  body("genres").isArray({min: 1}).withMessage("Must have at least one genre"),
  body("developer").notEmpty().withMessage("Must pick developer").escape(),
  body("publisher").notEmpty().withMessage("Must pick publisher").escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    // Create new document with Model.prototype to use Schema methods
    const game = new Game({ 
      title: req.body.title,
      summary: req.body.summary,
      genres: req.body.genres,
      release_date: req.body.release,
      developer: req.body.developer,
      publisher: req.body.publisher,
      price: req.body.price
    });

    if(!errors.isEmpty()) {
      async.parallel({
        genres: (callback) => Genre.find({}, callback),
        developers: (callback) => Developer.find({}, callback),
        publishers: (callback) => Publisher.find({}, callback),
      }, (err, {genres, developers, publishers}) => {
        if(err) return next(err);

        // Mark the previously selected choices
        for(let g of genres) {
          if(game.genres.indexOf(g._id) > -1) 
            g.checked = true;
        }

        if(game.developer) {
          // Mark the previously selected choices
          for(let dev of developers) {
            if(game.developer.equals(dev._id)) 
              dev.checked = true;
          }
        }

        if(game.publisher) {
          // Mark the previously selected choices
          for(let pub of publishers) {
            if(game.publisher.equals(pub._id)) 
              pub.checked = true;
          }
        }

        (async () => {
          const files = [req.files["cover"][0], ...req.files["screenshots"]];
          for(let file of files) {
            try {
              await fs.unlink(file.path);
            } catch(err) {
              console.log("error deleting a file");
            }
          }
        })();

        // Re-render the form with previously submitted values
        res.render("game_form", {title: "Create Game", game, genres, developers, publishers, errors: errors.mapped(), user: req.user});
      });
    } else {
      game.save((err, game) => {
        if(err) return next(err);

        (async () => {
          const gamePath = path.join(__dirname, `../public/images/games/${game._id}/`);
          const files = [req.files["cover"][0], ...req.files["screenshots"]];

          try {
            const gamedir = await fs.mkdir(gamePath, {recursive: true});

            for(let file of files)
              await fs.rename(file.path, `${gamedir}/${file.filename}`);
            
            res.redirect(game.url);
          } catch(err) {
            for(let file of files) {
              try {
                await fs.unlink(file.path);
              } catch(err) {
                return next(err);
              }
            }
            return next(err);
          }
        })();
      })
    }
  },
]

exports.game_delete_get = (req, res, next) => {
  if(!((req.user && req.user.level) && req.user.level >= 3)) {
    const error = new Error();
    error.status = 404;
    return next(error);
  }

  Game.findById(req.params.id, (err, game) => {
    if(err) return next(err);

    res.render("game_delete", {game, user: req.user});
  });
}

exports.game_delete_post = (req, res, next) => {
  if(!((req.user && req.user.level) && req.user.level >= 3)) {
    const error = new Error();
    error.status = 404;
    return next(error);
  }

  Game.findByIdAndDelete(req.body.id, (err) => {
    if(err) return next(err);

    (async () => {
      const gamePath = path.join(__dirname, `../public/images/games/${req.body.id}/`);

      try {
        const gameFiles = await fs.readdir(gamePath);
        
        for(let file of gameFiles)
          await fs.unlink(path.join(gamePath, file));
        
        await fs.rmdir(gamePath);

        res.redirect("/game");
      } catch(err) {
        return next(err);
      }
    })();
  })
}

exports.game_update_get = (req, res, next) => {
  if(!((req.user && req.user.level) && req.user.level >= 3)) {
    const error = new Error();
    error.status = 404;
    return next(error);
  }

  async.parallel({
    game: (callback) => Game.findById(req.params.id, callback),
    genres: (callback) => Genre.find().exec(callback),
    developers: (callback) => Developer.find().exec(callback),
    publishers: (callback) => Publisher.find().exec(callback)
  }, (err, {game, genres, developers, publishers}) => {
    if(err) return next(err);

    if(!game) {
      const err = new Error("Game not found");
      err.status = 404;
      return next(err);
    }

    for(let g of genres) {
      if(game.genres.indexOf(g._id) > -1) 
        g.checked = true;
    }

    if(game.developer) {
      for(let dev of developers) {
        if(game.developer.equals(dev._id)) 
          dev.checked = true;
      }
    }

    if(game.publisher) {
      for(let pub of publishers) {
        if(game.publisher.equals(pub._id)) 
          pub.checked = true;
      }
    }

    (async () => {
      const gameDir = path.join(__dirname, `../public/images/games/${game._id}`);

      try {
        const gameFileNames = await fs.readdir(gameDir);
        let gameFiles = gameFileNames.map(gf => `/images/games/${game._id}/${gf}`);

        const cover = gameFiles.filter(f => f.indexOf("main.jpg") > -1)[0];
        const screenshots = gameFiles.filter(f => f.indexOf("ss") > -1);

        gameFiles = {cover, screenshots};

        res.render("game_form", {title: "Update Game", game, gameFiles, genres, developers, publishers, user: req.user});
      } catch(err) {
        const error = new Error("Unexpected Error");
        error.status = 500;
        return next(err);
      }
    })();
  });
}

exports.game_update_post = [
  (req, res, next) => {

    if(!((req.user && req.user.level) && req.user.level >= 3)) {
      const error = new Error();
      error.status = 404;
      return next(error);
    }
    next();
  },

  upload.fields([{name: "cover", maxCount: 1}, {name: "screenshots", maxCount: 10}]),

  // replace undefined (empty) with an empty array
  (req, res, next) => {
    // genres will be an array only if MORE THAN ONE GENRES ARE SELECTED (ikr, fucking inconsistent)
    if(!(req.body.genres instanceof Array)) {
        if(!req.body.genres)
            req.body.genres = [];
        else {
          req.body.genres = [req.body.genres];
        }        
    }
    next();
  },

  body("title").trim().isLength({min: 1, max: 100}).withMessage("Must contain 1 - 100 characters").escape(),
  body("summary").trim().isLength({min: 1, max: 500}).withMessage("Must contain 1 - 500 characters").escape(),
  body("release").trim().isDate().withMessage("Invalid date input").escape(),
  body("price").trim().isInt({min: 0}).withMessage("Must be an integer, min: 0").escape(),
  body("genres").isArray({min: 1}).withMessage("Must have at least one genre"),
  body("developer").notEmpty().withMessage("Must pick developer").escape(),
  body("publisher").notEmpty().withMessage("Must pick publisher").escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    // Create new document with Model.prototype to use Schema methods
    const game = new Game({ 
      _id: req.body.id,
      title: req.body.title,
      summary: req.body.summary,
      genres: req.body.genres,
      release_date: req.body.release,
      developer: req.body.developer,
      publisher: req.body.publisher,
      price: req.body.price
    });

    if(!errors.isEmpty()) {
      async.parallel({
        genres: (callback) => Genre.find({}, callback),
        developers: (callback) => Developer.find({}, callback),
        publishers: (callback) => Publisher.find({}, callback),
      }, (err, {genres, developers, publishers}) => {
        if(err) return next(err);

        // Mark the previously selected choices
        for(let g of genres) {
          if(game.genres.indexOf(g._id) > -1) 
            g.checked = true;
        }

        if(game.developer) {
          // Mark the previously selected choices
          for(let dev of developers) {
            if(game.developer.equals(dev._id)) 
              dev.checked = true;
          }
        }

        if(game.publisher) {
          // Mark the previously selected choices
          for(let pub of publishers) {
            if(game.publisher.equals(pub._id)) 
              pub.checked = true;
          }
        }

        (async () => {
          const files = [req.files["cover"][0], ...req.files["screenshots"]];
          
          try {
            for(let file of files) {
              await fs.unlink(file.path);
            } 
          } catch(err) {
            const error = new Error("Unnexpected Error");
            error.status = 500;
            return next(err);
          }

          // Get image urls of the associated game for re-rendering the form
          const gamePath = path.join(__dirname, `../public/images/games/${game._id}/`);

          try {
            let gameFiles = await fs.readdir(gamePath);
            gameFiles = gameFiles.map(gf => `/images/games/${game._id}/${gf}`);
    
            const cover = gameFiles.filter(f => f.indexOf("main.jpg") > -1)[0];
            const screenshots = gameFiles.filter(f => f.indexOf("ss") > -1);
    
            gameFiles = {cover, screenshots};
    
            // Re-render the form with previously submitted data and images
            res.render("game_form", {title: "Update Game", game, gameFiles, genres, developers, publishers, errors: errors.mapped(), user: req.user});
          } catch(err) {
            return next(err);
          }
        })();
      });
    } else {
      Game.findByIdAndUpdate(game._id, game, {new: true}, (err) => {
        if(err) return next(err);

        (async () => {
          const cover = req.files.cover;
          const screenshots = req.files.screenshots;
          const gameDir = path.join(__dirname, `../public/images/games/${game._id}/`);

          try {
            if(!cover && !screenshots)
            res.redirect(game.url);

            if(cover) {
              const coverPath = cover[0].path; 
              await fs.rename(coverPath, `${gameDir}/${cover[0].filename}`);
            }

            if(screenshots) {
              let oldScreenshots = await fs.readdir(gameDir);
              oldScreenshots = oldScreenshots.filter(oss => oss.indexOf("ss") > -1);

              for(let ss of oldScreenshots) 
                  await fs.unlink(`${gameDir}/${ss}`);

              for(let newss of screenshots) 
                await fs.rename(newss.path, `${gameDir}/${newss.filename}`);
            }
            
            res.redirect(game.url);

          } catch(err) {
            return next(err);
          }
        })();
      });
    }
  },
]

const randomize = (array) => {
  const randomized = [];
  const occupied = [];
  
  for(let i = 0; i < array.length; i++) {
    let random;

    do {
      random = Math.floor(Math.random() * 100);

      if(random > array.length -1) 
        random %= array.length;

    } while(occupied.includes(random));
    occupied.push(random);
    randomized[random] = array[i];
  }

  return randomized;
}
