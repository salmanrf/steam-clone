#! /usr/bin/env node
console.log('This script populates some test games, developers, genres, publishers and reviews to your database');

// Get arguments passed on command line
const userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
const async = require('async');
const Game = require('./models/game');
const Genre = require('./models/genre');
const Publisher = require('./models/publisher');
const Developer = require('./models/developer');

// mongo "mongodb+srv://eleum:eleumloyce@cluster0.ivvyx.mongodb.net/"
// mongo "mongodb+srv://eleum:eleumloyce@cluster0.kdwx4.mongodb.net/"

const mongoose = require('mongoose');
const mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const games = {};
const genres = {};
const developers = {};
const publishers = {};

const gameCreate = (title, developer, publisher, genres, summary, release_date, cb) => {
  const gameDetail = {title, developer, publisher, genres, summary, release_date};  
  const game = new Game(gameDetail);
       
  game.save((err) => {
    if(err) {
      cb(err, null);
      return;
    }
    console.log('New Game: ' + game);
    games[game.title] = game;
    cb(null, game);
  });
}

const genreCreate = (name, description, cb) => {
  const genreDetail = {name};
  if(description) genreDetail.description = description;     
  const genre = new Genre({name});

  genre.save((err) => {
    if(err) {
      callback(err, null);
      return;
    }
    console.log('New Genre: ' + genre);
    genres[genre.name] = genre;
    cb(null, genre);
  });
}

const devCreate = (name, description, cb) => {
  const devDetail = {name}; 
  if(description) devDetail.description = description;
  const dev = new Developer(devDetail);    

  dev.save((err) => {
    if(err) {
      cb(err, null);
      return;
    }
    console.log('New Developer: ' + dev);
    developers[dev.name] = dev;
    cb(null, dev);
  });
}


const publisherCreate = (name, description, cb) => {
  const publisherDetail = {name};   
  if(description) publisherDetail.description = description;

  const publisher = new Publisher(publisherDetail);    

  publisher.save((err) => {
    if(err) {
      cb(err, null);
      return;
    }
    console.log('New Publisher: ' + publisher);
    publishers[publisher.name] = publisher;
    cb(null, publisher);
  });
}

const createGenres = (cb) => {
  async.parallel([
      (callback) => genreCreate('Open World', null, callback),
      (callback) => genreCreate('Cyberpunk', null, callback),
      (callback) => genreCreate('Futuristic', null, callback),
      (callback) => genreCreate('Sci-fi', null, callback),
      (callback) => genreCreate('Action', null, callback),
      (callback) => genreCreate('Ninja', null, callback),
      (callback) => genreCreate('Beautiful', null, callback),
      (callback) => genreCreate('Singleplayer', null, callback),
  ], cb);
}

const createDevelopers = (cb) => {
  async.parallel([
      (callback) => devCreate('CD PROJEKT RED', null, callback),
      (callback) => devCreate('QLOC', null, callback),
  ], cb);
}

const createPublishers = (cb) => {
  async.parallel([
      (callback) => publisherCreate('CD PROJEKT RED', null, callback),
      (callback) => publisherCreate('Activision', null, callback),
  ], cb);
}

const cyberpunkSum = "Cyberpunk 2077 is an open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification. You play as V, a mercenary outlaw going after a one-of-a-kind implant that is the key to immortality.";
const dksremasteredSum = "Then, there was fire. Re-experience the critically acclaimed, genre-defining game that started it all. Beautifully remastered, return to Lordran in stunning high-definition detail running at 60fps. ";
const oriatwotwSum = "Play the critically acclaimed masterpiece. Embark on a new journey in a vast, exotic world where you’ll encounter towering enemies and challenging puzzles on your quest to unravel Ori’s destiny.";
const dks2Sum = "DARK SOULS™ II: Scholar of the First Sin brings the franchise’s renowned obscurity & gripping gameplay to a new level. Join the dark journey and experience overwhelming enemy encounters, diabolical hazards, and unrelenting challenge.";
const sekiroSum = "Game of the Year - The Game Awards 2019 Best Action Game of 2019 - IGN Carve your own clever path to vengeance in the award winning adventure from developer FromSoftware, creators of Bloodborne and the Dark Souls series. Take Revenge. Restore Your Honor. Kill Ingeniously.";

const createGames = (cb) => {
    async.parallel({
      developers: (callback) => Developer.find({}, callback),
      publishers: (callback) => Publisher.find({}, callback),
      genres: (callback) => Genre.find({}, callback)
    }, (err, results) => {
      if(err) {
        cb(err, null);
        throw error(err);
      }

      for(let d of results.developers) {
        developers[d.name] = d;
      }

      for(let g of results.genres) {
        genres[g.name] = g;
      }

      for(let p of results.publishers) {
        publishers[p.name] = p;
      }

      // (title, developer, publisher, genres, summary, release_date, cb)
      async.series([
        (callback) => {
          gameCreate('Cyberpunk 2077', developers['CD PROJEKT RED'], publishers['CD PROJEKT RED'], [genres['Open World'], genres['Cyberpunk'], genres['RPG'], genres['Futuristic'], genres['Sci-fi']], cyberpunkSum, new Date('2020-12-10'), callback);
        },
        (callback) => {
          gameCreate('DARK SOULS™: REMASTERED', developers['QLOC'], publishers['BANDAI NAMCO'], [genres['Souls-like'], genres['Dark Fantasy'], genres['Difficult'], genres['RPG'], genres['Co-op']], dksremasteredSum, new Date('2018-05-24'), callback);
        },
        (callback) => {
          gameCreate('Ori and the Will of the Wisps', developers['Moon Studios GmbH'], publishers['Xbox Game Studios'], [genres['Great Soundtrack'], genres['Metroidvania'], genres['Action'], genres['Beautiful']], oriatwotwSum, new Date('2020-03-11'), callback);
        },
        (callback) => {
          gameCreate('DARK SOULS™ II: Scholar of the First Sin', developers['FromSoftware, Inc.'], publishers['BANDAI NAMCO'], [genres['Souls-like'], genres['Dark Fantasy'], genres['Difficult'], genres['RPG'], genres['Co-op']], dks2Sum, new Date('2015-04-02'), callback);
        },
        (callback) => {
          gameCreate('Sekiro™: Shadows Die Twice - GOTY Edition', developers['FromSoftware, Inc.'], publishers['Activision'], [genres['Souls-like'], genres['Difficult'], genres['Action'], genres['Singleplayer'], genres['Ninja']], sekiroSum, new Date('2019-03-22'), callback);
        }
      ], cb);
    });
}

async.series([
    // createGenres,  
    // createDevelopers,
    // createPublishers,
    createGames,
], (err, results) => {
    if(err) {
        console.log('FINAL ERR: '+ err);
    }
    else {
        console.log(results);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});

return;