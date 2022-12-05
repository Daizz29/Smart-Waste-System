function distanceBetween2Node(start, dest){
    var startPoint = L.latLng(start.lat, start.lng);
    var destPoint = L.latLng(dest.lat, dest.lng);
    var dist = startPoint.distanceTo(destPoint);
    return dist;
}
function routing(Locations){
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
    return Route;
}

function checkForRouting(Locations, path){
    var count = 0;
    Locations.forEach(function(loc){
        if(loc.cap >= 70){
            count++;
            if(!path.includes(loc)){
                path.push(loc);
            }
            
        }
        
    });
    if(count/Locations.length >= 0.6){return true;}
    return false;
}
  
function creatMarker(loc){
    var markerIcon = null;
    if(loc.cap <= 30){
        markerIcon = greenIcon;
    }
    else if(loc.cap > 30 && loc.cap < 70){
        markerIcon = yellowIcon;
    }
    else{
        markerIcon = redIcon;
    }
    var marker = L.marker([loc.lat, loc.lng], {icon: markerIcon}).on("click", function(e){
        const infor = document.getElementById("infor");
        infor.style.display = "block";
        document.getElementById("name").innerHTML = loc.name;
        document.getElementById("cap").innerHTML = loc.cap;
        document.getElementById("state").innerHTML = loc.state;
        document.getElementById("nameInput").value = loc.name;
        document.getElementById("stateInput").value = loc.state;
        document.getElementById("capInput").value = loc.cap;
        document.getElementById("idInput").value = JSON.stringify(loc.key);
    });
    return marker;
}

function sendAjax(){
    const name = document.getElementById("nameInput").value;
    const state = document.getElementById("stateInput").value;
    ajax = $.ajax({
        type: "POST",
        url: "http://localhost:3000/waste/control",
        data: {
            name: name,
            state: state
        },
        dataType: "JSON",
        success: function(data){
            console.log("Ajax sent!");
            console.log(data.mess);
        }
    });
}

function sendWs(){
    const name = document.getElementById("nameInput").value;
    const state = document.getElementById("stateInput").value;
    console.log("Clicked!")
    var socket = io.connect();
    socket.emit('control', {
        name: name,
        state: state
    });
}
var LeafIcon = L.Icon.extend({
options: {
    iconSize:     [38, 40],
    iconAnchor:   [19, 40],
    popupAnchor:  [0, -40]
}
});
var greenIcon = new LeafIcon({iconUrl: './Icon/green-bin-icon.png'});
var yellowIcon = new LeafIcon({iconUrl: './Icon/yellow-bin-icon.png'});
var redIcon = new LeafIcon({iconUrl: './Icon/red-bin-icon.png'});

$(document).ready(async function(){
    var socket = io();
    var path = [];
    var map = L.map("map").setView([21.001975258290276, 105.8031678199768], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
    var route = L.Routing.control({
        show: false,
        draggableWaypoints: false,
        createMarker: function(i, start, n){
            var marker = creatMarker(path[i]);
            if(i == 0){
                marker = marker.bindPopup("Start point");
                setTimeout(() => {
                marker.openPopup();
                }, 5000);
            }
            return marker;
        }
    }).addTo(map);
    if(checkForRouting(loc, path)){
        path = await routing(path);
        console.log(path);
        route.setWaypoints(path);
        loc.forEach(function(lc){
            if(!path.includes(lc)){
                if(lc.cap <= 30){
                    creatMarker(lc).addTo(map);
                }
                else if(lc.cap > 30 && lc.cap < 70){
                    creatMarker(lc).addTo(map);
                }
            }
        });
    }
    else{
        map.setView([loc[0].lat, loc[0].lng], 17)
        loc.forEach(function(lc){
            creatMarker(lc).addTo(map);
        });
    }
    
    /*setInterval(() => {
        if(loc.length != 0){
            var temp = loc.splice(0, 1);
            route.setWaypoints(loc);
            L.marker(temp[0], {icon: greenIcon}).addTo(map);
        }
    }, 3000);*/
    socket.on('change stream', async function(msg){
        var locI = loc.findIndex(e => JSON.stringify(e.key) === JSON.stringify(msg.id._id));
        var pathI = path.findIndex(e => JSON.stringify(e.key) === JSON.stringify(msg.id._id));
        if(msg.data.capacity != null){
            loc[locI].cap = Number(msg.data.capacity);
            if(pathI > -1 && Number(msg.data.capacity) >= 70){
                path[pathI].cap = Number(msg.data.capacity);
            }
            else if(pathI > -1 && Number(msg.data.capacity) < 70){
                path.splice(pathI, 1);
                creatMarker(loc[locI]).addTo(map);
            }
            else{
                map.eachLayer(function(layer){
                    if(layer._latlng != null && layer._latlng.lat == loc[locI].lat && layer._latlng.lng == loc[locI].lng){
                        console.log("141");
                        map.removeLayer(layer);
                        return;
                    }
                });
                if(pathI == -1 && Number(msg.data.capacity) >= 70){
                    path.push(loc[locI]);
                }
                else{
                    let marker = creatMarker(loc[locI]);
                    map.addLayer(marker);
                }
            }
        }
        if(msg.data.state != null){
            loc[locI].state = msg.data.state;
            if(pathI > -1){
                path[pathI].state = msg.data.state;
            }
        }
        
        if(infor.style.display === "block" && document.getElementById("idInput").value === JSON.stringify(msg.id._id)){
            if(msg.data.capacity != null){
                document.getElementById("cap").innerHTML = Number(msg.data.capacity);
            }
            if(msg.data.state != null){
                document.getElementById("state").innerHTML = msg.data.state;
            }
        }
        if(checkForRouting(loc, path)){
            path = await routing(path);
            route.setWaypoints(path);
        }
        else{
            route.setWaypoints([]);
            path.forEach(function(lc){
                creatMarker(lc).addTo(map);
            });
        }
    });
});



