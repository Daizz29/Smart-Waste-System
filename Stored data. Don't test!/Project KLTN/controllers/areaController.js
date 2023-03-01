const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Area = mongoose.model('Area');

var areaController = {

    getByManagerId: async function(id){
        const result = await Area.find({
            manager_id: id
        });
        return result;
    },

    getById: async function(id){
        const result = await Area.findById(mongoose.Types.ObjectId(id));
        return result;
    },

    updateLocation: async function(id, lat, lng){
        await Area.updateOne(
            {_id: ObjectId(id)},
            {$set: {location: [lat, lng]}}
        );
    },

    addToListBins: async function(id, newbin){
        list = await Area.findOne({
            _id: ObjectId(id)
        }).list_bin;
        list.push(newbin);
        await Area.updateOne(
            {_id: ObjectId(id)},
            {$set: {list_bin: list}}
        );
    },

    deleteBin: async function(id, delbin){
        list = await Area.findOne({
            _id: ObjectId(id)
        }).list_bin;
        var index = list.indexOf(delbin);
        list.splice(index, 1);
        await Area.updateOne(
            {_id: ObjectId(id)},
            {$set: {list_bin: list}}
        );
    },

    addToListCars: async function(id, newcar){
        list = await Area.findOne({
            _id: ObjectId(id)
        }).list_car;
        list.push(newcar);
        await Area.updateOne(
            {_id: ObjectId(id)},
            {$set: {list_car: list}}
        );
    },
    
    addToListBin: async function(id, delcar){
        list = await Area.findOne({
            _id: ObjectId(id)
        }).list_car;
        var index = list.indexOf(delcar);
        list.splice(index, 1);
        await Area.updateOne(
            {_id: ObjectId(id)},
            {$set: {list_car: list}}
        );
    }

};

module.exports = areaController;