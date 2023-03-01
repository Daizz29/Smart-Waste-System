const mongoose = require('mongoose');

var wasteSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    latitude: Number,
    longitude: Number,
    capacity: {
        type: Number,
        default: 660
    },
    fullness: {
        type: Number,
        default: 0
    },
    state: Boolean,
    density: {
        type: Array,
        default: []
    },
    area_id: {
        type: String,
        default: ""
    },
    penalty_time: {
        type: Array,
        default: []
    }
}, { versionKey: false });

module.exports = mongoose.model("Waste", wasteSchema);