const express = require('express');
var router = express.Router();
var accountController = require('../controllers/accountController');

router.post('/login', async (req, res) =>{
    const result = await accountController.getByNameAndPass(req.body.username, req.body.pass);
    if(result){
        req.session.userid = result._id;
        req.session.acctype = result.accType;
        if(result.accType == 2){
            req.session.save(() =>{
                res.redirect("http://localhost:3000/manager");
            });
        }
        else if (result.accType == 1){
            req.session.save(() =>{
                res.redirect("http://localhost:3000/collector");
            });
        }
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