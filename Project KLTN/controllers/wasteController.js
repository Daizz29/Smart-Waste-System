const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Waste = mongoose.model('Waste');

var wasteController = {

    getByAreaId: async function(id){
        const result = await Waste.find({
            area_id: id
        });
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
        var now = new Date();
        var curDate = now.getDate() + "/" + (now.getMonth()+1) + "/" + now.getFullYear();
        var bin = await Waste.findById(id);
        console.log(bin);
        var pTimeList = bin.penalty_time;
        console.log(pTimeList);
        if(pTimeList.length > 0){
            if(curDate === pTimeList[pTimeList.length - 1].date){
                pTimeList[pTimeList.length - 1].time += (now.getTime() - pTime.getTime())/1000;
            }
            else{
                if(pTimeList.length == 7){
                    pTimeList.splice(0, 1);
                }
                const newpTime = {
                    time: (now.getTime() - pTime.getTime())/1000,
                    date: curDate
                };
                pTimeList.push(newpTime);
            }
        }
        else{
            const newpTime = {
                time: (now.getTime() - pTime.getTime())/1000,
                date: curDate
            };
            pTimeList.push(newpTime);
        }
        await Waste.updateOne(
            {_id: id},
            {$set: {penalty_time: pTimeList}}
        );
    }

};

module.exports = wasteController;