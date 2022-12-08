const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://Miracle:miracle141@cluster0.jzardua.mongodb.net/waste_management_system?retryWrites=true&w=majority", {
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