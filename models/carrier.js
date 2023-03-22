const mongoose = require('mongoose');
const businessSchema = require('./business');
const documentSchema = require('./document');

const carrierSchema = new mongoose.Schema({
  ...businessSchema.obj,
  ...documentSchema.obj
}, { timestamps: true });

const Carrier = mongoose.model('Carrier', carrierSchema);

module.exports = Carrier;
