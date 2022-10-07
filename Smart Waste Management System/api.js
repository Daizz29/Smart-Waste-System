
const firebaseConfig = {
  apiKey: "AIzaSyD6PqjdmbzqiIikg-QfRLJRcgDb1IgWU68",
  authDomain: "random-data-31454.firebaseapp.com",
  databaseURL: "https://random-data-31454-default-rtdb.firebaseio.com",
  projectId: "random-data-31454",
  storageBucket: "random-data-31454.appspot.com",
  messagingSenderId: "319436233994",
  appId: "1:319436233994:web:4b687ce8000a26b685eef3",
  measurementId: "G-9DH8PT1004"
};

firebase.initializeApp(firebaseConfig);

var locationDB = firebase.database().ref("wasteClass/");

var LeafIcon = L.Icon.extend({
  options: {
    iconSize:     [38, 40],
    iconAnchor:   [19, 40],
    popupAnchor:  [0, -40]
  }
});
var greenIcon = new LeafIcon({iconUrl: './Icon/greenMarker.png'});
var yellowIcon = new LeafIcon({iconUrl: './Icon/yellowMarker.png'});
var redIcon = new LeafIcon({iconUrl: './Icon/redMarker.png'});


/*const addLocation = (lat, lng) => {
  var newLocation = locationDB.push();
  newLocation.set({
      latitude: lat,
      longitude: lng,
  });
};*/
const showAllLoction = () => {
  /*function loadData(){
    return locationDB.once("value");
  }
  var Locations = [];
  snapshot1 = loadData().then(snapshot1 =>{
    
    snapshot1.forEach(function(childSnapshot){
      var loc = {lat: childSnapshot.val().Latitude, lng: childSnapshot.val().Longtitde};
      Locations.push(loc);
      console.log(childSnapshot.val());
    });
    return Locations;

  }).then(Locations => {
    console.log(Locations[0]);
  });
  var map = L.map('map').setView([21.001975258290276, 105.8031678199768], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
  }).addTo(map);
  var route = L.Routing.control({
      show: true,
      //waypoints: [Locations[0], Locations[1]]
  }).addTo(map);
  route.setWaypoints(Locations);
  route.on('routesfound', function (e){
    distance = e.routes[0].summary.totalDistance;
    console.log(distance);
    
  });
  console.log(Locations[0]);*/
  locationDB.on('value', function(snapshot){
      var Locations = [];
      snapshot.forEach(function(childSnapshot){
          var loc = {lat: childSnapshot.val().latitde, lng: childSnapshot.val().longtitde};
          Locations.push(loc);
          console.log(childSnapshot.val());
      });
      //Locations.splice(1,1);
      var map = L.map('map').setView([21.001975258290276, 105.8031678199768], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
      }).addTo(map);
      var route = L.Routing.control({
          show: true,
          //waypoints: [Locations[0], Locations[1]]
      }).addTo(map);
      route.setWaypoints(Locations);
      route.on('routesfound', function (e){
        distance = e.routes[0].summary.totalDistance;
        console.log(distance);
        
      });
  });
  
  
}


function distanceBetween2Node(start, dest){
  var startPoint = L.latLng(start.lat, start.lng);
  var destPoint = L.latLng(dest.lat, dest.lng);
  startWP = new L.Routing.Waypoint;
  startWP.latLng = startPoint;    

  destWP = new L.Routing.Waypoint;
  destWP.latLng = destPoint;    
  var myRoute = L.Routing.osrmv1();
  myRoute.route([startWP, destWP], (err, routes) => {
      distance = routes[0].summary.totalDistance;
      console.log('routing distance:', distance);
  });
  var dist = startPoint.distanceTo(destPoint);
  
  
  console.log(dist);
  return dist;
}


const routing = () => {
  locationDB.on('value', function(snapshot){
    var Locations = [];
    var Route = [];
    snapshot.forEach(function(childSnapshot){
      var loc = {lat: childSnapshot.val().latitde, lng: childSnapshot.val().longtitde, cap: childSnapshot.val().capacity};
      Locations.push(loc);
      console.log(childSnapshot.val());
    });
    let startLoc = Locations[0];
    let nextLoc = Locations[0];
    Locations.splice(0, 1);
    Route.push(startLoc);
    while(Locations.length != 0){
      var minDist = 10000000;
      Locations.forEach(function(unvisited){
        var dist = distanceBetween2Node(startLoc, unvisited);
        //var test = parseFloat($("dist").attr("data"));
        //console.log("My test: ", test);
        if(dist < minDist){
          minDist = dist;
          nextLoc = unvisited;
        }
      });
      
      console.log(minDist);
      console.log(nextLoc);
      startLoc = nextLoc;
      Route.push(nextLoc);
      var index = Locations.indexOf(nextLoc);
      Locations.splice(index, 1);
    }
    var map = L.map('map').setView([21.001975258290276, 105.8031678199768], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
    var route = L.Routing.control({
        show: true,
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
    route.setWaypoints(Route);
  });
}

$(document).ready(function(){
  //addLocation(21.0036985859343, 105.80643995586865);
  //showAllLoction();
  routing();
  //window.alert("Hello Miracle");
});