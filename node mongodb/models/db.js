const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://Miracle:miracle141@cluster0.jzardua.mongodb.net/sample_airbnb?retryWrites=true&w=majority", {
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