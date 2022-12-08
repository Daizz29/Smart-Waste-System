const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Waste = mongoose.model('Waste');
const mqtt = require("mqtt");

function distanceBetween2Node(start, dest){
    var dLat = dest.lat - start.lat;
    var dLng = dest.lng - start.lng;
    var dist = Math.sqrt(dLat*dLat + dLng*dLng);
    return dist;
}
function routing(Locations){
    var Route = [];
    let startLoc = Locations[0];
    let nextLoc = Locations[0];
    Locations.splice(0, 1);
    Route.push(startLoc);
    while(Locations.length != 0){
        var minDist = 10000000;
        Locations.forEach(function(unvisited){
        var dist = distanceBetween2Node(startLoc, unvisited);
        if(dist < minDist){
            minDist = dist;
            nextLoc = unvisited;
        }
        });
        startLoc = nextLoc;
        Route.push(nextLoc);
        var index = Locations.indexOf(nextLoc);
        Locations.splice(index, 1);
    }
    return Route;
}

function checkForRouting(Locations, path){
    var count = 0;
    Locations.forEach(function(loc){
        if(loc.cap != null && loc.cap >= 70){
            count++;
            if(!path.includes(loc)){
                path.push(loc);
            }
            
        }
        
    });
    if(count/(Locations.length-2) >= 0.6){return true;}
    return false;
}

router.get('/', async (req, res) => {
    if(req.session.user){
        Waste.find(async (err,docs) =>{
            if(!err){
                var list = [];
                list.push({lat: 21.04211684020953, lng: 105.81889511534075});
                list.push({lat: 21.04211684020953, lng: 105.81889511534075});
                var path = [];
                docs.forEach(function(doc){
                    let loc = {key: doc._id, lat: Number(doc.latitude), lng: Number(doc.longtitude), cap: Number(doc.capacity), name: doc.name, state: doc.state};
                    list.push(loc);
                });
                if(checkForRouting(list, path) || req.session.onRoute){
                    path.unshift(list[0]);
                    path = await routing(path);
                    path.push(list[1]);
                    req.session.onRoute = true;
                }
                else{
                    path = [];
                }
                if(path.length <= 1){
                    req.session.onRoute = null;
                }
                res.render('main_views/home', {
                    script: "home.js",
                    style: "home.css",
                    list: encodeURIComponent(JSON.stringify(list)),
                    path: encodeURIComponent(JSON.stringify(path))
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

router.post('/onroute', async (req, res) => {
    var list = req.body.list;
    list = JSON.parse(list);
    console.log(list);
    var path = [];
    if(checkForRouting(list, path) || req.session.onRoute){
        path.unshift(list[0]);
        path = await routing(path);
        path.push(list[1]);
        req.session.onRoute = true;
    }
    else{
        path = []
    }
    if(path.length <= 1){
        req.session.onRoute = null;
    }
    res.json({
        route: JSON.stringify(path)
    })
});

module.exports = router;