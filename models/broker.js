const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BusinessSchema = require("./business");

const brokerSchema = new Schema({
  ...BusinessSchema.obj,  
}, { timestamps: true });

const Broker = mongoose.model("Broker", brokerSchema);

module.exports = Broker;
