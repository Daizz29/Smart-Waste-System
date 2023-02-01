const mongoose = require('mongoose');

var penRecordSchema = new mongoose.Schema({
    bin_id: String,
    time: {
        type: Date,
        default: new Date()
    }
}, { versionKey: false });

module.exports = mongoose.model("Penalty_record", penRecordSchema);