const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Waste = mongoose.model('Waste');
const mqtt = require("mqtt");

router.get('/', async (req, res) => {
    if(req.session.User){
        Waste.find((err,docs) =>{
            if(!err){
                var list = [];
                docs.forEach(function(doc){
                    list.push({key: doc._id, lat: Number(doc.latitude), lng: Number(doc.longtitude), cap: Number(doc.capacity), name: doc.name, state: doc.state});
                });
                console.log(list);
                res.render('main_views/home', {
                    script: "home.js",
                    style: "home.css",
                    list: encodeURIComponent(JSON.stringify(list))
                });
            }
            else{
                console.log("Error!");
            }
        });
    }
    else{
        res.redirect("http://localhost:3000");
    }
    /*let docs = await Waste.find().exec();
    res.render('main_views/home', {
        script: "home.js",
        list: encodeURIComponent(JSON.stringify(docs))
    });
    console.log(docs);*/
});

router.post('/', async (req, res) =>{
    /*const newWaste = new Waste({
        latitude: req.body.lat,
        longtitude: req.body.lng 
    });

    newWaste.save().then(result => {console.log(result);}).catch(err => {console.log(err)});*/
    const result = await Waste.updateOne({name: req.body.name}, {$set: {"capacity": req.body.cap}});
    console.log(`${result.matchedCount} docs matched`);
    console.log(`${result.modifiedCount} docs modified`);

});

router.post('/control', (req, res) => {
    console.log("new message");
    var name = req.body.name;
    var state = req.body.state;
    console.log(name);
    console.log(state);
    var stateCtrl = "";
    if(state === "open"){
        stateCtrl = false;
    }
    else if(state === "close"){
        stateCtrl = true;
    }
    const data = {
        state: stateCtrl
    }
    var MQTTclient = mqtt.connect('mqtt://171.244.173.204:1884');
    MQTTclient.on('connect', () =>{
        MQTTclient.publish('wasteManagement/'+name+'/control', JSON.stringify(data));
        MQTTclient.end();
    });
    res.json({
        mess: "Success"
    })
});


module.exports = router;