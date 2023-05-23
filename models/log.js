const mongoose = require('mongoose');



const logSchema = new mongoose.Schema({
    invite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invite',
      required: true,
    },
    ipAddress: String,
    userAgent: String,
    referrer: String,
    language: String,
    accessTime: {
      type: Date,
      default: Date.now,
    },
    platform: {
      type: String,
      default: 'Unknown',
    },
  }, { timestamps: true });

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
