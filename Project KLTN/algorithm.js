var algorithm = {

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