const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Waste = mongoose.model('Waste');

var wasteController = {

    getByAreaId: async function(id){
        const result = await Waste.find({
            area_id: id
        });
        console.log(result);
        return result;
    },

    getAll: async function(){
        const result = await Waste.find();
        return result;
    },

    updateState: async function(id, state){
        await Waste.updateOne(
            {_id: ObjectId(id)},
            {$set: {state: state}}
        );
    },
    
    updatePenaltyTime: async function(id, pTime){
        await Waste.updateOne(
            {_id: ObjectId(id)},
            {$set: {penalty_time: pTime}}
        );
    }

};

module.exports = wasteController;