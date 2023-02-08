function creatMarker(loc){
    var markerIcon = null;
    if(loc.cap == null){
    }
    else{
        if(loc.cap <= 30){
        markerIcon = greenIcon;
        }
        else if(loc.cap > 30 && loc.cap < 70){
            markerIcon = yellowIcon;
        }
        else{
            markerIcon = redIcon;
        }
    }
    var marker = null;
    if(markerIcon == null){
        marker = L.marker([loc.lat, loc.lng]);    
    }
    else{
        marker = L.marker([loc.lat, loc.lng], {icon: markerIcon}).on("click", function(e){
            const infor = document.getElementById("infor");
            infor.style.display = "block";
            document.getElementById("name").innerHTML = loc.name;
            document.getElementById("cap").innerHTML = loc.cap;
            document.getElementById("nameInput").value = loc.name;
            document.getElementById("stateInput").value = loc.state;
            document.getElementById("capInput").value = loc.cap;
            document.getElementById("idInput").value = JSON.stringify(loc.key);
            if(loc.state === "open"){
                document.getElementById('on-off').checked = false;
            }
            else{
                document.getElementById('on-off').checked = true;
            }
        });
    }
    
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

function updateSession(loc){
    const stringData = JSON.stringify(loc);
    jQuery.extend({
        getValues: function(stringData){
            var result = null;
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/waste/onroute",
                data: {
                    list: stringData
                },
                dataType: "JSON",
                async: false,
                success: function(data){
                    result = JSON.parse(data.route);
                }
            });
            return result;
        }
    });
    return $.getValues(stringData);
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
        if(currentState === "open"){
            document.getElementById('on-off').checked = false;
        }
        else{
            document.getElementById('on-off').checked = true;
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
    var socket = io();
    var cMarker, cLat, cLng;
    var map = L.map("map").setView([21.001975258290276, 105.8031678199768], 10);
    map.on("click", () =>{
        if(document.getElementById("infor").style.display === "block"){
            document.getElementById("infor").style.display = "none"
        }
    });
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
    console.log(path);

    // initial marker and route
    if(path.length == 0){
        map.setView([loc[0].lat, loc[0].lng], 17);
    }
    route.setWaypoints(path);
    loc.forEach(function(lc){
        if(!path.includes(lc)){
            creatMarker(lc).addTo(map);
        }
    });
    /*setInterval(() => {
        if(loc.length != 0){
            var temp = loc.splice(0, 1);
            route.setWaypoints(loc);
            L.marker(temp[0], {icon: greenIcon}).addTo(map);
        }
    }, 3000);*/

    // on Capacity change throught socket.io
    socket.on('change stream', async function(msg){
        var locI = loc.findIndex(e => JSON.stringify(e.key) === JSON.stringify(msg.id._id));
        console.log(loc);
        if(msg.data.capacity != null){
            let newCap = Number(msg.data.capacity);
            var temp = loc[locI].cap;
            loc[locI].cap = newCap;
            if((temp < 70 && newCap >= 70) || (temp >= 70 && newCap < 70)){
                path = [];
                console.log(loc);
                path = await updateSession(loc);
                console.log(path);
                map.eachLayer(function(layer){
                    if(layer._latlng != null){
                        map.removeLayer(layer);
                    }
                });
                route.setWaypoints(path);
                loc.forEach(function(lc){
                    if(!path.includes(lc)){
                        creatMarker(lc).addTo(map);
                    }
                });
            }
            else{
                map.eachLayer(function(layer){
                    if(layer._latlng != null && layer._latlng.lat == loc[locI].lat && layer._latlng.lng == loc[locI].lng){
                        console.log("141");
                        map.removeLayer(layer);
                        return;
                    }
                });
                creatMarker(loc[locI]).addTo(map);
            }
        }
        if(msg.data.state != null){
            loc[locI].state = msg.data.state;
        }
        
        if(infor.style.display === "block" && document.getElementById("idInput").value === JSON.stringify(msg.id._id)){
            if(msg.data.capacity != null){
                document.getElementById("cap").innerHTML = Number(msg.data.capacity);
                document.getElementById("capInput").value = Number(msg.data.capacity);
            }
            if(msg.data.state != null){
                document.getElementById("stateInput").value = msg.data.state;
                if(msg.data.state === "close"){
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

    // Track current location
    const fakeLoc = [{lat: 21.03982937176743, lng: 105.84714471875014}, {lat: 21.02437959665869, lng: 105.85681042947161}, {lat: 21.022617017653715, lng: 105.85056624739211}];
    if (!navigator.geolocation) {
        alert("Your browser doesn't support geolocation feature!")
    } else {
        var i = 0;
        setInterval(async () => {
            if(path.length != 0){
                /*navigator.geolocation.getCurrentPosition(async function getPosition(position) {
                    cLat = position.coords.latitude;
                    cLng = position.coords.longitude;
                    if (cMarker) {
                        map.removeLayer(cMarker);
                    }
                    cMarker = L.marker([cLat, cLng]).addTo(map);
                    loc.splice(0, 1, {lat: cLat, lng: cLng});
                    console.log("Moving");
                    path = [];
                    path = await updateSession(loc);
                    route.setWaypoints(path);
                });*/
                if(cMarker){
                    map.removeLayer(cMarker);
                }
                cMarker = L.marker([fakeLoc[i].lat, fakeLoc[0].lng]).addTo(map);
                loc.splice(0, 1, fakeLoc[0]);
                path = [];
                path = await updateSession(loc);
                route.setWaypoints(path);
            }
            else{
                if (cMarker) {
                    map.removeLayer(cMarker);
                }
            }
        }, 5000);
    }

    // onClick on-off switch
    document.getElementById("on-off").addEventListener("click", sendWs);
});



