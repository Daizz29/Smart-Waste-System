const mongoose = require('mongoose');

var carSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "Undefined"
    },
    capacity: Number,
    powConsump: Number,
    routing: {
        type: Array,
        default: []
    },
    collector_id: {
        type: String,
        default: ""
    },
    opDist: {
        type: Array,
        default: []
    },
    area_id: {
        type: String,
        default: ""
    },
    position: {
        latitude: {
            type: Number,
            default: 0
        },
        longitude: {
            type: Number,
            default: 0
        }
    }
}, { versionKey: false });

module.exports = mongoose.model("Car", carSchema);