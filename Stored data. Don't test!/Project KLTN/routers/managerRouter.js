const express = require('express');
var router = express.Router();
var areaController = require('../controllers/areaController');
var accountController = require('../controllers/accountController');
var carController = require('../controllers/carController');
var wasteController = require('../controllers/wasteController');

router.get('/', async (req, res) =>{
    if(req.session.userid && req.session.acctype == 2){
        var managerAcc = await accountController.getById(req.session.userid);
        var listBin = await wasteController.getByAreaId(managerAcc.area_id);
        var cars = await carController.getByAreaId(managerAcc.area_id);
        var path = [];
        cars.forEach(function(car){
            var route_car = {
                id: JSON.stringify(car._id),
                route: car.routing
            }
            path.push(route_car);
        });
        res.render('main_views/homeM', {
            script: "homeM.js",
            style: "homeM.css",
            accType: "manager",
            list: encodeURIComponent(JSON.stringify(listBin)),
            path: encodeURIComponent(JSON.stringify(path))
        });
    }
    else{
        res.redirect("http://localhost:3000");
    }
});

router.get('/info', async (req, res) =>{
    if(req.session.userid && req.session.acctype == 2){
        var managerAcc = await accountController.getById(req.session.userid);
        var area = await areaController.getByManagerId(req.session.userid.toString());
        res.render('main_views/infoM', {
            script: "infoM.js",
            style: "infoM.css",
            accType: "manager",
            acc: encodeURIComponent(JSON.stringify(managerAcc)),
            area: area[0].name
        });
    }
    else{
        res.redirect("http://localhost:3000");
    }
});

router.get('/listBin', async (req, res) =>{
    if(req.session.userid && req.session.acctype == 2){
        var managerAcc = await accountController.getById(req.session.userid);
        var listBin = await wasteController.getByAreaId(managerAcc.area_id);
        res.render('main_views/listBinM', {
            script: "listBinM.js",
            style: "listBinM.css",
            accType: "manager",
            list: encodeURIComponent(JSON.stringify(listBin))
        });
    }
    else{
        res.redirect("http://localhost:3000");
    }
});

router.get('/listCar', async (req, res) =>{
    if(req.session.userid && req.session.acctype == 2){
        var managerAcc = await accountController.getById(req.session.userid);
        var cars = await carController.getByAreaId(managerAcc.area_id);
        res.render('main_views/listCarM', {
            script: "listCarM.js",
            style: "listCarM.css",
            accType: "manager",
            list: encodeURIComponent(JSON.stringify(cars))
        });
    }
    else{
        res.redirect("http://localhost:3000");
    }
});

module.exports = router;