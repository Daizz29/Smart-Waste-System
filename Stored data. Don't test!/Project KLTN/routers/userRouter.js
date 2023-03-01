const express = require('express');
var router = express.Router();
var wasteController = require('../controllers/wasteController');
var algorithm = require("../algorithm");

router.get('/', async (req, res) =>{
    var listBin = await wasteController.getAll();
    res.render('main_views/homeU', {
        layout: false,
        script: "homeU.js",
        style: "homeU.css",
        list: encodeURIComponent(JSON.stringify(listBin))
    })
});

module.exports = router;