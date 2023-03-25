const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mcNumber: {
    type: String,
    required: true,
    // unique: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  address2: {
    type: String,
    trim: true,
  },
  zip: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  einNumber: {
    type: String,
    trim: true,
  },
  dotNumber: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Deactivated', 'Pending', 'inModeration', 'Declined'],
    default: 'Inactive',
    required: true,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = businessSchema;
