// const {DateTime} = require("luxon");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ForumSchema = new Schema({
  title: {type: String, required: true, minLength: 1, maxLength: 100},
  content: {type: String, required: true, minLength: 1, maxLength: 500},
  author: {type: Schema.Types.ObjectId, ref: 'User'},
  date: {type: Date, required: true, default: Date.now()}
});

// ForumSchema
//   .virtual('date_formatted')
//   .get(function() {return DateTime.fromJSDate(this.date).toISODate()});

ForumSchema
  .virtual('url')
  .get(function() {
    return `/forum/${this._id}`;
  });

module.exports = ForumSchema;
