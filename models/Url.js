const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  refCount: {
    type: Number,
    default: 1
  },
  queryList: {
    type: [String]
  },
  host: {
    type: String,
    required: true,
  },
  path: {
    type: String,
  }
}, {
  timestamps: false,
  versionKey: false,
});

const UrlModel = mongoose.model('Url', UrlSchema);
module.exports = UrlModel;