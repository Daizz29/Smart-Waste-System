const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Account = mongoose.model('Account');

router.post('/login', async (req, res) =>{
    const result = await Account.findOne({
        username: req.body.username,
        password: req.body.pass
    });
    if(result){
        req.session.user = result._id;
        req.session.save(() =>{
            res.redirect("http://localhost:3000/waste");
        });
    }
    else{
        res.redirect("http://localhost:3000");
    }
});

router.get('/logout', async (req, res) =>{
    req.session.destroy(() => {
        res.redirect("http://localhost:3000");
    })
});

module.exports = router;