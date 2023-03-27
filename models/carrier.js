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

const documentSchema = new Schema({
  coi: {
    type: String,
    path: String,
    expirationDate: Date,
  },
  liabilityInsuranceCertificate: {
    type: String,
    path: String,
    expirationDate: Date,
  },
  noa: {
    type: String,
    path: String,
    expirationDate: Date,
  },
  voidCheck: {
    type: String,
    path: String,
    expirationDate: Date,
  },
});

const carrierSchema = new Schema({
  ...BusinessSchema.obj, 
  payment: paymentSchema,
  documents: [documentSchema],
});

const Carrier = mongoose.model("Carrier", carrierSchema);

module.exports = Carrier;
