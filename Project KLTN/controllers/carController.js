const mongoose = require('mongoose');
const Car = mongoose.model('Car');

var carController = {

    getByAreaId: async function(id){
        const result = await Car.find({
            area_id: id
        });
        return result;
    },
    getByCollectorId: async function(id){
        const result = await Car.findOne({
            collector_id: id
        });
        return result;
    },

    changeCapacity: async function(car_id, capacity){
        await Car.updateOne(
            {_id: car_id},
            {$set: {capacity: capacity}}
        );
    },

    updateRoute: async function(car_id, route){
        await Car.updateOne(
            {_id: car_id},
            {$set: {routing: route}}
        );
    },

    updatePosition: async function(id, lat, lng){
        await Car.updateOne(
            {collector_id: id},
            {$set: {
                position: {
                    latitude: lat,
                    longitude: lng
                }
            }}
        );
    },

    updateOptime: async function(car_id, opTime){
        var now = new Date();
        var curDate = now.getDate() + "/" + now.getMonth() + "/" + now.getFullYear();
        var optimeList = await Car.findOne({
            _id: car_id
        }).opTime;
        if(curDate === optimeList[optimeList.length - 1].date){
            optimeList[optimeList.length - 1].time = opTime;
        }
        else{
            if(optimeList.length == 30){
                optimeList.splice(0, 1);
            }
            const newOpTime = {
                time: opTime,
                date: curDate
            };
            optimeList.push(newOpTime);
        }
        await Car.updateOne(
            {_id: car_id},
            {$set: {opTime: optimeList}}
        );
    }

};

module.exports = carController;