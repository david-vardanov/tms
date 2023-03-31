const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  mcNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: {
    type: Date,
    required: true,
  },
  isExpired: {
    type: Boolean,
    default: false,
  },
  logs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Log',
    },
  ],
}, { timestamps: true });

const Invite = mongoose.model('Invite', inviteSchema);

module.exports = Invite;
