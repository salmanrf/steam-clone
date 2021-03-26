const mongoose = require('mongoose');
const {DateTime} = require('luxon');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  title: {type: String, required: true, maxLength: 100},
  summary: {type: String, required: true, maxLength: 500},
  genres: [{type: Schema.Types.ObjectId, ref: 'Genre'}],
  developer: {type: Schema.Types.ObjectId, ref:'Developer', required: true},
  publisher: {type: Schema.Types.ObjectId, ref:'Publisher', required: true},
  release_date: {type: Date, required: true, default: Date.now},
  reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}],
  sells: {type: Number, min: 0},
  price: {type: Number, min: 0},
});

GameSchema
  .virtual('release_date_formatted')
  .get(function() {return DateTime.fromJSDate(this.release_date).toISODate()});

GameSchema
  .virtual('url')
  .get(function() {
    return `/game/${this._id}`;
  });

module.exports = mongoose.model('Game', GameSchema);