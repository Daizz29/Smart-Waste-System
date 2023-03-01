var wasteController = require('./controllers/wasteController');

var simulate = {
    main: async function(){
        var list = await wasteController.getAll();
        var i = 0;
        await simulate.timerPer1m(i, list);
    },

    timerPer10s: function(i, list){
        var start = new Date().getTime();
        var timer = setInterval(() => {
            const current = new Date().getTime();
            if(current - start >= 60000){
                clearInterval(timer);
                i++;
                console.log(i + " hour(s) ended");
                return;
            }
            list.forEach(async (e) => {
                await wasteController.updateFullness(e.id, simulate.wasteDensity(i));
            });
        }, 10000);
        return (i+1)%24;
    },
    
    timerPer1m: async function(i, list){
        i = await simulate.timerPer10s(i, list);
        setInterval(async () => {
            i = await simulate.timerPer10s(i, list);
        }, 60000);
        return i;
    },
    
    randomRange: function(min, max){
        return Math.random() * (max - min) + min;
    },
    
    wasteDensity: function(i){
        var w = 0;
        if(i >= 0 && i <= 5){
            w = simulate.randomRange(5/6, 10/6);
        }
        else if(i >= 6 && i <= 9){
            w = simulate.randomRange(30/6, 50/6);
        }
        else if(i >= 10 && i <= 16){
            w = simulate.randomRange(50/6, 70/6);
        }
        else if(i >= 17 && i <= 21){
            w = simulate.randomRange(80/6, 100/6);
        }
        else if(i >= 22 && i <= 23){
            w = simulate.randomRange(10/6, 20/6);
        }
        return w;
    }
};

module.exports = simulate;

