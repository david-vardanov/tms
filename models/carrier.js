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
  type: { type: String, enum: ['coi', 'noa', 'voidCheck', 'liabilityInsuranceCertificate'], required: true },
  url: { type: String, required: true }
});

const carrierSchema = new Schema({
  ...BusinessSchema.obj, 
  payment: paymentSchema,
  documents: [documentSchema],
});

const Carrier = mongoose.model("Carrier", carrierSchema);

module.exports = Carrier;
