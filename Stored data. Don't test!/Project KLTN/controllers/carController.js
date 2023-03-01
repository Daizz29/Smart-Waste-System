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

    //changed for simulating
    updateOpdist: async function(car_id, opDist, sDay){
        var now = new Date();
        now.setDate(now.getDate() + sDay);
        var curDate = now.getDate() + "/" + (now.getMonth()+1) + "/" + now.getFullYear();
        var car = await Car.findOne({
            _id: car_id
        });
        var opdistList = car.opDist;
        if(opdistList.length > 0){
            if(curDate === opdistList[opdistList.length - 1].date){
                opdistList[opdistList.length - 1].distance += opDist;
            }
            else{
                if(opdistList.length == 7){
                    optimeList.splice(0, 1);
                }
                const newOpdist = {
                    distance: opDist,
                    date: curDate
                };
                opdistList.push(newOpdist);
            }
        }
        else{
            const newOpdist = {
                distance: opDist,
                date: curDate
            };
            opdistList.push(newOpdist);
        }
        await Car.updateOne(
            {_id: car_id},
            {$set: {opDist: opdistList}}
        );
    }

};

module.exports = carController;