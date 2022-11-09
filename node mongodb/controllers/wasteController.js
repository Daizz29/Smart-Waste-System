const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Waste = mongoose.model('Waste');

router.get('/', (req, res) => {
    Waste.find((err,docs) =>{
        if(!err){
            res.render('main_views/home', {
                script: "home.js",
                list: encodeURIComponent(JSON.stringify(docs))
            });
        }
        else{
            console.log("Error!");
        }
    })
});

router.post('/', (req, res) =>{
    const newWaste = new Waste({
        latitude: req.body.lat,
        longtitude: req.body.lng 
    });

    newWaste.save().then(result => {console.log(result);}).catch(err => {console.log(err)});

});

module.exports = router;