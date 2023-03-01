const algorithm = require('./algorithm');
var carController = require('./controllers/carController');
var wasteController = require('./controllers/wasteController');
const mongoose = require('mongoose');

var carTracking = {

    main: async function(){
        const carStream = mongoose.model('Car').watch([]);
        var i = 0, sDay = 0;
        setInterval(() => {
            i = (i+1)%24;
        }, 60000);
        setInterval(() => {
            sDay++;
        }, 24*60000);
        carStream.on('change', async (next) =>{
            if(next.updateDescription.updatedFields.routing != null){
                var id =  next.documentKey._id;
                var car = await mongoose.model('Car').findById(id);
                var path = next.updateDescription.updatedFields.routing;
                if(path.length >= 2){
                    var distance = algorithm.distanceBetween2Node(path[0], path[1]);
                    var time = distance/carTracking.carVelocity(i);
                    setTimeout(async () => {
                        await carController.updatePosition(car.collector_id, path[1].latitude, path[1].longitude);
                        await carController.updateOpdist(car._id, distance, sDay);
                        if(path.length > 2){
                            await wasteController.updateDensity(path[1]._id, path[1].fullness*660/100, sDay);
                            await wasteController.updateFullness(path[1]._id, 0);
                        }
                        else if(path.length == 2){
                            await carController.updateRoute(car._id, []);
                        }
                    }, time*1000);
                }
            }
        });
    },

    carVelocity: function(i){
        var v = 0;
        if(i >= 0 && i <= 7){
            v = 60/60;
        }
        else if(i >= 8 && i <= 12){
            v = 30/60;
        }
        else if(i >= 13 && i <= 15){
            v = 40/60;
        }
        else if(i >= 16 && i <= 19){
            v = 20/60;
        }
        else if(i >= 20 && i <= 23){
            v = 40/60;
        }
        return v;   
    }
};

module.exports = carTracking;
