const mongoose = require('mongoose');

const lockSchema = new mongoose.Schema({
  resource: {
    type: String,
    required: true
  },
  holder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
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
}, { timestamps: true });

// Remove the old index and create a new compound unique index
lockSchema.index({ resource: 1, holder: 1 }, { unique: true });

module.exports = mongoose.model('Lock', lockSchema); 