const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Carrier = require('./carrier');

const StopSchema = new mongoose.Schema({
    orderNumber: { type: Number, required: true },
    address: { type: String, required: true },
    weight: { type: Number, required: true },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    city: { type: String, required: true },
    state: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    appointmentType: {
      type: String,
      enum: ['FCFS', 'Appointment'],
      required: true
    },
    stopType: {
      type: String,
      enum: ['PickUp', 'Delivery', 'Stop'],
      required: true
    },
  }, { timestamps: true });
  


const loadSchema = new Schema({
    sku: { 
        type: Number, 
        required: true,
        unique: true 
    },
    carrier: { 
        type: Schema.Types.ObjectId, 
        ref: 'Carrier' 
    },
    broker: { 
        type: Schema.Types.ObjectId, 
        ref: 'Broker' 
    },
    createdUser: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    assignedUser: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    mode: {
        type: String,
        enum: ['Full Truck Load', 'Less Than Truck Load', 'Partial Truck Load', 'Dedicated Truck Load'],
        required: true
    },
    equipment: {
        type: String,
        enum: ['Flatbed', 'Refrigerated', 'Dry Van', 'Step Deck', 'Double Drop', 'Removable Gooseneck'],
        required: true
    },
    details: {
        weight: {
            type: Number
        },
        dimensions: {
            length: Number,
            width: Number,
            height: Number
        }
    },
    comments: {
        type: String
    },
    specialInstructions: {
        type: String
    },
    paymentOption: {
        type: String,
        enum: ["factoring","standart", "quickpay1", "quickpay2", "quickpay3"],
    },
    stops: [StopSchema],
}, { timestamps: true });

loadSchema.statics.getNextSku = function() {
    return this.find().sort('-sku').limit(1)
        .then(([latestLoad]) => {
            if (latestLoad) {
                return latestLoad.sku + 1;
            } else {
                return 1; // This is the first sku, so let's start at 1
            }
        })
        .catch((err) => {
            throw new Error(err);
        });
};

loadSchema.pre('validate', function(next) {
    if (!this.sku) {
        Load.getNextSku()
            .then((nextSku) => {
                this.sku = nextSku;
                // If this is a new Load and a carrier is specified, fetch the carrier's payment method
                if (this.isNew && this.carrier) {
                    return Carrier.findById(this.carrier);
                }
            })
            .then((carrier) => {
                // If a carrier was found, assign its payment method to this load's payment option
                if (carrier) {
                    this.paymentOption = carrier.payment.paymentMethod;
                }
                next();
            })
            .catch((err) => {
                next(err);
            });
    } else {
        next();
    }
});

loadSchema.pre('save', function(next) {
    const pickUpStops = this.stops.filter(stop => stop.stopType === 'PickUp');
    const deliveryStops = this.stops.filter(stop => stop.stopType === 'Delivery');
  
    if (pickUpStops.length < 1) {
      this.invalidate('stops', new Error('At least one PickUp stop is required.'));
    } else if (deliveryStops.length < 1) {
      this.invalidate('stops', new Error('At least one Delivery stop is required.'));
    } else {
      next();
    }
  });
  


const Load = mongoose.model("Load", loadSchema);

module.exports = Load;
