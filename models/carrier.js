const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BusinessSchema = require("./business");

const paymentSchema = new Schema({
  paymentMethod: {
    type: String,
    enum: ["factoring", "quickpay1", "quickpay3", "quickpay5"],
    required: true,
  },
});

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['coi', 'noa', 'voidCheck', 'MCAuthority', 'w9', 'other', 'agreement' ] },
  url: { type: String, required: true }
});

const carrierSchema = new Schema({
  ...BusinessSchema.obj, 
  payment: paymentSchema,
  documents: [documentSchema],
  ownerName: String,
  signature: String,
  dispatcherName: String,
  dispatcherEmail: String,
  dispatcherPhone: String,
  
});

const Carrier = mongoose.model("Carrier", carrierSchema);

module.exports = Carrier;
