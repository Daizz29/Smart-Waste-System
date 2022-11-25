const mongoose = require('mongoose');

var wasteSchema = new mongoose.Schema({
    latitude: JSON,
    longtitude: String,
    capacity: {
        type: String,
        default: "0"
    },
    name: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: "open"
    }
});

module.exports = mongoose.model("Waste", wasteSchema);