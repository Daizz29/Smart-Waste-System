var algorithm = {

    velocity: 2/3,

    wasteDensity: 1/2, 

    distanceBetween2Node: function(start, dest){
        if ((start.latitude == dest.latitude) && (start.longitude == dest.longitude)) {
            return 0;
        }
        else {
            var radlat1 = Math.PI * start.latitude/180;
            var radlat2 = Math.PI * dest.latitude/180;
            var theta = start.longitude-dest.longitude;
            var radtheta = Math.PI * theta/180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180/Math.PI;
            dist = dist * 60 * 1.1515;
            dist = dist * 1.609344
            return dist;
        }
    },

    predictedPenTimeofaNode: function(distance, penRec, node){
        var moveTime = distance/algorithm.velocity;
        var i = penRec.findIndex(e => e.bin_id === node._id.toString());
        var pPenTime = 0;
        if(i != -1){
            var now = new Date();
            var cPenTime = now.getTime() - penRec[i].time.getTime();
            pPenTime = cPenTime + moveTime;
        }
        else{
            var iWaste = moveTime*algorithm.wasteDensity;
            if(node.fullness + (iWaste*100)/node.capacity >= 90){
                var cWaste = node.capacity*node.fullness/100;
                pPenTime += (cWaste + iWaste - node.capacity*90/100)/algorithm.wasteDensity;
            }
        }
        return pPenTime;
    },

    routing: function(Locations, penRec){
        var Route = [];
        let startLoc = Locations[0];
        let nextLoc = Locations[0];
        Locations.splice(0, 1);
        Route.push(startLoc);
        while(Locations.length != 0){
            var minCost = 10000000;
            Locations.forEach(function(unvisited){
                var dist = algorithm.distanceBetween2Node(startLoc, unvisited);
                var predPenTime = algorithm.predictedPenTimeofaNode(dist, penRec, unvisited);
                var cost = 0.3*dist/algorithm.velocity + 0.7*(15 - predPenTime);
                if(cost < minCost){
                    minCost = cost;
                    nextLoc = unvisited;
                }
            });
            startLoc = nextLoc;
            Route.push(nextLoc);
            var index = Locations.indexOf(nextLoc);
            Locations.splice(index, 1);
        }
        return Route;
    },
    
    checkForRouting: function(Locations, path){
        var count = 0;
        var countPen = 0;
        Locations.forEach(function(loc){
            if(loc.fullness != null && loc.fullness >= 70){
                count++;
                if(loc.fullness >= 90){
                    countPen++;
                }
                if(!path.includes(loc)){
                    path.push(loc);
                }
            }
            else if(loc.fullness != null && loc.fullness < 70){
                var cWaste = loc.capacity*loc.fullness/100;
                if(cWaste + algorithm.wasteDensity*60 >= loc.capacity*90/100){
                    if(!path.includes(loc)){
                        path.push(loc);
                    }
                }
            }
        });
        if(count/(Locations.length) >= 0.6 || countPen > 0){return true;}
        return false;
    }
}

module.exports = algorithm;