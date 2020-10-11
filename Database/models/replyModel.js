const mongoose = require('mongoose');

const replyModel = mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  replyText: {
    type: String,
  },
});

module.exports = mongoose.model('Reply', replyModel);
