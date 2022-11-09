function distanceBetween2Node(start, dest){
    var startPoint = L.latLng(start.lat, start.lng);
    var destPoint = L.latLng(dest.lat, dest.lng);
    var dist = startPoint.distanceTo(destPoint);
    return dist;
}
  
function routing(Locations, map, route){
    var Route = [];
    let startLoc = Locations[0];
    let nextLoc = Locations[0];
    Locations.splice(0, 1);
    Route.push(startLoc);
    while(Locations.length != 0){
        var minDist = 10000000;
        Locations.forEach(function(unvisited){
        var dist = distanceBetween2Node(startLoc, unvisited);
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
    if(route == null){
        console.log("Initial route");
        route = L.Routing.control({
            show: true,
            draggableWaypoints: false,
            createMarker: function(i, start, n){
            var markerIcon = null;
            if(Route[i].cap <= 30){
                markerIcon = greenIcon;
            }
            else if(Route[i].cap > 30 && Route[i].cap < 70){
                markerIcon = yellowIcon;
            }
            else{
                markerIcon = redIcon;
            }
            var marker = L.marker(start.latLng, {icon: markerIcon});
            if(i == 0){
                marker = L.marker(start.latLng, {icon: markerIcon}).bindPopup("Start point");
                setTimeout(() => {
                marker.openPopup();
                }, 5000);
            }
            return marker;
            }
        }).addTo(map);
    }
    route.setWaypoints(Route);
}


