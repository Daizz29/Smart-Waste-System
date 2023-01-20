var algorithm = {

    distanceBetween2Node: function(start, dest){
        var dLat = dest.latitude - start.latitude;
        var dLng = dest.longitude - start.longitude;
        var dist = Math.sqrt(dLat*dLat + dLng*dLng);
        return dist;
    },

    routing: function(Locations){
        var Route = [];
        let startLoc = Locations[0];
        let nextLoc = Locations[0];
        Locations.splice(0, 1);
        Route.push(startLoc);
        while(Locations.length != 0){
            var minDist = 10000000;
            Locations.forEach(function(unvisited){
            var dist = algorithm.distanceBetween2Node(startLoc, unvisited);
            if(dist < minDist){
                minDist = dist;
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
        Locations.forEach(function(loc){
            if(loc.fullness != null && loc.fullness >= 70){
                count++;
                if(!path.includes(loc)){
                    path.push(loc);
                }
                
            }
            
        });
        if(count/(Locations.length) >= 0.6){return true;}
        return false;
    }

}

module.exports = algorithm;