const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentSchema = new Schema({
  type: { 
    type: String, 
    enum: ['NOA', 'VOID check', 'insurance'], 
    required: true 
  },
  expirationDate: { 
    type: Date, 
    required: function() { 
      return this.type === 'insurance'; 
    } 
  }
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
