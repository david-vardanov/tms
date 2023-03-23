const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentSchema = new Schema({
  carrier: {
    type: Schema.Types.ObjectId,
    ref: 'Carrier',
    required: true,
  },
  type: {
    type: String,
    enum: ['NOA', 'VOID check', 'insurance'],
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: function () {
      return this.type === 'insurance';
    },
  },
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
