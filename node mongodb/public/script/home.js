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
    var map = L.map("map").setView([21.001975258290276, 105.8031678199768], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
    var route = L.Routing.control({
        show: true,
        draggableWaypoints: false,
        createMarker: function(i, start, n){
            var markerIcon = null;
            if(loc[i].cap <= 30){
                markerIcon = greenIcon;
            }
            else if(loc[i].cap > 30 && loc[i].cap < 70){
                markerIcon = yellowIcon;
            }
            else{
                markerIcon = redIcon;
            }
            var marker = L.marker(start.latLng, {icon: markerIcon}).on("click", function(e){
                console.log(this.getLatLng());
                console.log(loc[i].cap);
                console.log(loc[i].key);
                const infor = document.getElementById("infor");
                infor.style.display = "block";
                document.getElementById("name").innerHTML = loc[i].name;
                document.getElementById("cap").innerHTML = loc[i].cap;
                document.getElementById("state").innerHTML = loc[i].state;
                document.getElementById("nameInput").value = loc[i].name;
                document.getElementById("stateInput").value = loc[i].state;
                document.getElementById("capInput").value = loc[i].cap;
                document.getElementById("idInput").value = JSON.stringify(loc[i].key);
            });
            if(i == 0){
                marker = marker.bindPopup("Start point");
                setTimeout(() => {
                marker.openPopup();
                }, 5000);
            }
            return marker;
        }
    }).addTo(map);
    loc = await routing(loc);
    console.log(loc);
    route.setWaypoints(loc);

    /*setInterval(() => {
        if(loc.length != 0){
            var temp = loc.splice(0, 1);
            route.setWaypoints(loc);
            L.marker(temp[0], {icon: greenIcon}).addTo(map);
        }
    }, 3000);*/
    socket.on('change stream', function(msg){
        console.log(msg);
        console.log(msg.data.capacity);
        loc.forEach(async function(Loc){
            if(JSON.stringify(Loc.key) === JSON.stringify(msg.id._id)){
                console.log("141");
                if(msg.data.capacity != null){
                    Loc.cap = Number(msg.data.capacity);
                    loc = await routing(loc);
                    console.log(loc);
                    route.setWaypoints(loc);
                }
                if(msg.data.state != null){
                    Loc.state = msg.data.state;
                }
            }
        });
        if(infor.style.display === "block" && document.getElementById("idInput").value === JSON.stringify(msg.id._id)){
            if(msg.data.capacity != null){
                document.getElementById("cap").innerHTML = Number(msg.data.capacity);
            }
            if(msg.data.state != null){
                document.getElementById("state").innerHTML = msg.data.state;
            }
        }
        
    });
    
    
});



