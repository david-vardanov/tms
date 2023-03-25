const mongoose = require('mongoose');
const businessSchema = require('./business');

const documentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  path: { type: String, required: true },
  expirationDate: { type: Date }
}, { timestamps: true });

const carrierSchema = new mongoose.Schema({
  ...businessSchema.obj,
  documents: [documentSchema],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Deactivated', 'Pending', 'inModeration', 'Declined'],
    default: 'Inactive',
    required: true,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Carrier = mongoose.model('Carrier', carrierSchema);

module.exports = Carrier;
