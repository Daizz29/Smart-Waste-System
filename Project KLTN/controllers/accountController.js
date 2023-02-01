const mongoose = require('mongoose');
const Account = mongoose.model('Account');

var accountController = {

    getByNameAndPass: async function(username, pass){
        const result = await Account.findOne({
            username: username,
            password: pass
        });
        return result;
    },

    getById: async function(id){
        const result = await Account.findOne({
            _id: id
        });
        return result;
    },

    addAccount: async function(username, pass, type){
        var newAcc = new Account();
        newAcc.username = username;
        newAcc.password = pass;
        newAcc.accType = type;
        await Account.insertOne(newAcc);
        console.log("New account created!");
    },

    sendComment: async function(bin, comment){
        var ar_id = bin.area_id;
        const mng_acc = await Account.findOne({
            area_id: ar_id
        });
        const cmtObj = {
            content: comment,
            date: new Date()
        };
        var cmtList = mng_acc.comments;
        cmtList.push(cmtObj);
        await Account.updateOne(
            {_id: mng_acc._id},
            {$set: {comments: cmtList}}
        );
    },

    getCollectotByAreaId: async function(id){
        const result = await Account.find({
            area_id: id,
            accType: 1
        });
        return result;
    }

};

module.exports = accountController;