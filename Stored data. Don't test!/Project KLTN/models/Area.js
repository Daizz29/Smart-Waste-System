const mongoose = require('mongoose');

var areaSchema = new mongoose.Schema({
    name: String,
    location: {
        type: Array,
        default: [21.04215692027415, 105.81879048692633]
    },
    list_bin: {
        type: Array,
        default: []
    },
    list_car: {
        type: Array,
        default: []
    },
    manager_id: {
        type: String,
        default: ""
    },
}, { versionKey: false });

module.exports = mongoose.model("Area", areaSchema);