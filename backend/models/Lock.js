const mongoose = require('mongoose');

const lockSchema = new mongoose.Schema({
  resource: {
    type: String,
    required: true
  },
  holder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Remove the old index and create a new compound unique index
lockSchema.index({ resource: 1, expiresAt: 1 });

module.exports = mongoose.model('Lock', lockSchema); 