const mongoose = require('mongoose');

var accountSchema = new mongoose.Schema({
    username: String,
    password: String,
    accType: Number,
    area_id: {
        type: String,
        default: ""
    },
    comments: {
        type: Array,
        default: []
    },
    car_id: {
        type: String,
        default: ""
    }
}, { versionKey: false });

module.exports = mongoose.model("Account", accountSchema);