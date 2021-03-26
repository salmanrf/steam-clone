const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeveloperSchema = new Schema({
  name: {type: String, required: true, maxLength: 100},
});

DeveloperSchema
  .virtual('url')
  .get(function() {return `/developer/${this._id}`});

module.exports = mongoose.model('Developer', DeveloperSchema);