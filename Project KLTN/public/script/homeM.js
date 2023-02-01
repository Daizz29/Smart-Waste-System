function creatMarker(loc){
    var markerIcon = null;
    if(loc.fullness != null){
        if(loc.fullness <= 30){
        markerIcon = greenIcon;
        }
        else if(loc.fullness > 30 && loc.fullness < 70){
            markerIcon = yellowIcon;
        }
        else{
            markerIcon = redIcon;
        }
    }
    var marker = null;
    if(markerIcon == null){
        marker = L.marker([loc.latitude, loc.longitude]);    
    }
    else{
        marker = L.marker([loc.latitude, loc.longitude], {icon: markerIcon}).on("click", function(e){
            const infor = document.getElementById("infor");
            infor.style.display = "block";
            document.getElementById("name").innerHTML = loc.name;
            document.getElementById("cap").innerHTML = loc.fullness;
            document.getElementById("nameInput").value = loc.name;
            document.getElementById("stateInput").value = loc.state;
            document.getElementById("capInput").value = loc.fullness;
            document.getElementById("idInput").value = JSON.stringify(loc._id);
            if(loc.state){
                document.getElementById('on-off').checked = false;
            }
            else{
                document.getElementById('on-off').checked = true;
            }
        });
    }
    
    return marker;
}

function convertLatLng(array){
    var result = [];
    array.forEach(function(a){
        var temp = {
            _id: a._id,
            name: a.name,
            lat: a.latitude,
            lng: a.longitude,
            capacity: a.capacity,
            fullness: a.fullness,
            state: a.state,
            rating: a.rating,
            area_id: a.area_id,
            penalty_time: a.penalty_time
        };
        result.push(temp);
    });
    return result;
}

function sendWs(){
    const name = document.getElementById("nameInput").value;
    const state = document.getElementById("stateInput").value;
    document.getElementById("on-off").disabled = true;
    document.getElementById("loader").style.display = "inline-block";
    console.log("Clicked!")
    var socket = io.connect();
    socket.emit('control', {
        name: name,
        state: state
    });
    setTimeout(() => {
        document.getElementById("on-off").disabled = false;
        let currentState = document.getElementById("stateInput").value;
        console.log(currentState);
        if(currentState === "false"){
            document.getElementById('on-off').checked = true;
        }
        else if(currentState === "true"){
            document.getElementById('on-off').checked = false;
        }
        if(document.getElementById("loader").style.display === "inline-block"){
            document.getElementById("loader").style.display = "none"
        }
    }, 10000);
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
    // declare variables
    console.log(true);
    var socket = io();
    var map = L.map("map").setView([loc[0].latitude, loc[0].longitude], 17);
    map.on("click", () =>{
        if(document.getElementById("infor").style.display === "block"){
            document.getElementById("infor").style.display = "none"
        }
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
    
    console.log(paths);

    // initial marker and route
    var routesControl = [];
    paths.forEach(function(routes){
        var path = routes.route;
        pathLatLng = convertLatLng(path);
        console.log(path);
        var route = L.Routing.control({
            show: false,
            draggableWaypoints: false,
            lineOptions: {
                styles: [{color: 'blue', opacity: 1, weight: 1}]
            },          
            createMarker: function(i, start, n){
                var marker = creatMarker(path[i]);
                if(i == 0){
                    marker = marker.bindPopup("Start point");
                    setTimeout(() => {
                    marker.openPopup();
                    }, 5000);
                }
                return marker;
            },

        }).addTo(map);
        route.setWaypoints(pathLatLng);
        routesControl.push(route);
        console.log(route.getWaypoints());
    });
    
    loc.forEach(function(lc){
        creatMarker(lc).addTo(map);
    });
    /*setInterval(() => {
        if(loc.length != 0){
            var temp = loc.splice(0, 1);
            route.setWaypoints(loc);
            L.marker(temp[0], {icon: greenIcon}).addTo(map);
        }
    }, 3000);*/

    // on Capacity change throught socket.io
    socket.on('waste change', async function(msg){
        var locI = loc.findIndex(e => JSON.stringify(e._id) === JSON.stringify(msg.id._id));
        console.log(loc);
        if(msg.data.fullness != null){
            let newCap = Number(msg.data.fullness);
            loc[locI].fullness = newCap;
            map.eachLayer(function(layer){
                if(layer._latlng != null && layer._latlng.lat == loc[locI].latitude && layer._latlng.lng == loc[locI].longitude){
                    console.log("141");
                    map.removeLayer(layer);
                    return;
                }
            });
            creatMarker(loc[locI]).addTo(map);
        }
        if(msg.data.state != null){
            loc[locI].state = msg.data.state;
        }
        
        if(infor.style.display === "block" && document.getElementById("idInput").value === JSON.stringify(msg.id._id)){
            if(msg.data.fullness != null){
                document.getElementById("cap").innerHTML = Number(msg.data.fullness);
                document.getElementById("capInput").value = Number(msg.data.fullness);
            }
            if(msg.data.state != null){
                document.getElementById("stateInput").value = msg.data.state;
                if(msg.data.state === false){
                    document.getElementById("on-off").checked = true;
                }
                else{
                    document.getElementById("on-off").checked = false;
                }
                if(document.getElementById("on-off").disabled){
                    document.getElementById("on-off").disabled = false;
                }
                if(document.getElementById("loader").style.display === "inline-block"){
                    document.getElementById("loader").style.display = "none"
                }
            }
        }
    });

    socket.on('car change', function(msg){
        var index = paths.findIndex(e => e.id === msg.data.id);
        paths[index].route = msg.data.route;
        routesControl.forEach(function(route){
            map.removeControl(route);
        });
        routesControl = [];
        map.eachLayer(function(layer){
            if(layer._latlng != null){
                map.removeLayer(layer);
            }
        });
        paths.forEach(function(routes){
            var path = routes.route;
            pathLatLng = convertLatLng(path);
            console.log(path);
            var route = L.Routing.control({
                show: false,
                draggableWaypoints: false,
                lineOptions: {
                    styles: [{color: 'blue', opacity: 1, weight: 1}]
                },          
                createMarker: function(i, start, n){
                    var marker = creatMarker(path[i]);
                    if(i == 0){
                        marker = marker.bindPopup("Start point");
                        setTimeout(() => {
                        marker.openPopup();
                        }, 5000);
                    }
                    return marker;
                },
    
            }).addTo(map);
            routesControl.push(route);
            route.setWaypoints(pathLatLng);
            console.log(route.getWaypoints());
        });
        
        loc.forEach(function(lc){
            creatMarker(lc).addTo(map);
        });
    });
    // onClick on-off switch
    document.getElementById("on-off").addEventListener("click", sendWs);
});



