const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  author: {type: String, maxLength: 100},
  summary: {type: String, required: true, maxLength: 500},
  score: {type: Number, min: 0, max: 10}
});

module.exports = mongoose.model('Review', ReviewSchema);