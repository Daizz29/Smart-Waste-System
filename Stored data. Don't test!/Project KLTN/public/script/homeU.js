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
            document.getElementById("capInput").value = loc.fullness;
            document.getElementById("idInput").value = JSON.stringify(loc._id);
        });
    }
    
    return marker;
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
    var cMarker, cLat, cLng;
    var map = L.map("map");
    if (!navigator.geolocation) {
        alert("Your browser doesn't support geolocation feature!")
    } else {
        navigator.geolocation.getCurrentPosition(async function getPosition(position) {
            cLat = position.coords.latitude;
            cLng = position.coords.longitude;
            if (cMarker) {
                map.removeLayer(cMarker);
            }
            cMarker = L.marker([cLat, cLng]).addTo(map);
            map.setView([cLat, cLng], 17);
        });
        setInterval(async () => {
            navigator.geolocation.getCurrentPosition(async function getPosition(position) {
                cLat = position.coords.latitude;
                cLng = position.coords.longitude;
                if (cMarker) {
                    map.removeLayer(cMarker);
                }
                cMarker = L.marker([cLat, cLng]).addTo(map);
            });
        }, 5000);
    }
    map.on("click", () =>{
        if(document.getElementById("infor").style.display === "block"){
            document.getElementById("infor").style.display = "none"
        }
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    loc.forEach(function(lc){
        creatMarker(lc).addTo(map);
    });

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

        if(infor.style.display === "block" && document.getElementById("idInput").value === JSON.stringify(msg.id._id)){
            if(msg.data.fullness != null){
                document.getElementById("cap").innerHTML = Number(msg.data.fullness);
                document.getElementById("capInput").value = Number(msg.data.fullness);
            }
        }
    });

});