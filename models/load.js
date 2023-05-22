const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    }
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

loadSchema.pre('save', function(next) {
    if (!this.sku) {
        this.model('Load').getNextSku()
            .then((nextSku) => {
                this.sku = nextSku;
                next();
            })
            .catch((err) => {
                next(err);
            });
    } else {
        next();
    }
});

const Load = mongoose.model("Load", loadSchema);

module.exports = Load;
