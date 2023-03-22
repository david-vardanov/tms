const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  documents: [
    {
      name: { type: String, required: true },
      type: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
}, { timestamps: true });

module.exports = documentSchema;
