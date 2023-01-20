const express = require('express');
var router = express.Router();
var areaController = require('../controllers/areaController');
var accountController = require('../controllers/accountController');
var carController = require('../controllers/carController');
var wasteController = require('../controllers/wasteController');

router.get('/', async (req, res) =>{
    if(req.session.userid && req.session.acctype == 1){
        var collectorAcc = await accountController.getById(req.session.userid);
        var listBin = await wasteController.getByAreaId(collectorAcc.area_id);
        console.log(req.session.userid);
        var car = await carController.getByCollectorId(req.session.userid.toString());
        var path = car.routing;
        console.log(car);
        console.log(path);
        res.render('main_views/homeC', {
            script: "homeC.js",
            style: "homeC.css",
            list: encodeURIComponent(JSON.stringify(listBin)),
            path: encodeURIComponent(JSON.stringify(path))
        });
    }
    else{
        res.redirect("http://localhost:3000");
    }
});

router.post('/position', async (req, res) =>{
    var car = await carController.getByCollectorId(req.session.userid.toString());
    var path = car.routing;
    if(path.length > 0){
        path.splice(0, 1, {latitude: Number(req.body.latitude), longitude: Number(req.body.longitude)});
        if(path.length == 2 && path[0].latitude == path[1].latitude && path[0].longitude == path[1].longitude){
            path = [];
        }
        await carController.updateRoute(car._id, path);
    }
    await carController.updatePosition(req.session.userid.toString(), req.body.latitude, req.body.longitude);
    res.json({
        mess: "success"
    });
});

module.exports = router;