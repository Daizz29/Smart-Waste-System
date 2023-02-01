const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://Miracle:miracle141@cluster0.jzardua.mongodb.net/kltn_db?retryWrites=true&w=majority", {
    useNewUrlParser: true
},
err => {
    if(!err){
        console.log("Connection succeed");
    }
    else{
        console.log("Connection error: "+err);
    }
});

require('./Waste');
require('./Account');
require('./Car');
require('./Area');
require('./Penalty_record');