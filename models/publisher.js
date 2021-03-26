const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PublisherSchema = new Schema({
  name: {type: String, required: true, maxLength: 100},
});

PublisherSchema
  .virtual('url')
  .get(function() {return `/publisher/${this._id}`});

module.exports = mongoose.model('Publisher', PublisherSchema);