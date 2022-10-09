
const firebaseConfig = {
  apiKey: "AIzaSyBDY-3IobU92TqP7AXgSjKCSFALbfAjS0Q",
  authDomain: "smartwastemanagementsyst-f67e6.firebaseapp.com",
  databaseURL: "https://smartwastemanagementsyst-f67e6-default-rtdb.firebaseio.com",
  projectId: "smartwastemanagementsyst-f67e6",
  storageBucket: "smartwastemanagementsyst-f67e6.appspot.com",
  messagingSenderId: "952007266067",
  appId: "1:952007266067:web:0b846a7b87104e0ec854e6",
  measurementId: "G-MD4HNCGT3D"
};

firebase.initializeApp(firebaseConfig);

var locationDB = firebase.database().ref("waste/");

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

function findLocation(location, keyLoc){
  return location.key == keyLoc;
}

function distanceBetween2Node(start, dest){
  var startPoint = L.latLng(start.lat, start.lng);
  var destPoint = L.latLng(dest.lat, dest.lng);
  /*startWP = new L.Routing.Waypoint;
  startWP.latLng = startPoint;    

  destWP = new L.Routing.Waypoint;
  destWP.latLng = destPoint;    
  var myRoute = L.Routing.osrmv1();
  myRoute.route([startWP, destWP], (err, routes) => {
      distance = routes[0].summary.totalDistance;
      console.log('routing distance:', distance);
  });*/
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
    route = L.Routing.control({
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
  }
  route.setWaypoints(Route);
  var routeArr = [];
  routeArr.push(Route);
  routeArr.push(route);
  return routeArr;
}

async function showRoute(map){
  var Locations = [];
  locationDB.on('value', function(snapshot){
  
    snapshot.forEach(function(childSnapshot){
      var loc = {key: childSnapshot.key, lat: childSnapshot.val().latitde, lng: childSnapshot.val().longtitde, cap: childSnapshot.val().capacity};
      Locations.push(loc);
      console.log(childSnapshot.val());
    });
    //console.log(routing(Locations, map, null));
    console.log("inside function");
    return routing(Locations, map, null);
  });
  console.log("outside function");
  //console.log(Locations);
}

const updateData = (map, routeArr) => {
  locationDB.on('child_changed', function(snapshot){
    console.log("updating");
    var route = routeArr[1];
    var Route = routeArr[0];
    var locChanged = {key: snapshot.key, lat: snapshot.val().latitde, lng: snapshot.val().longtitde, cap: snapshot.val().capacity};
    var locFound = Route.find(x => x.key == snapshot.key);
    var indexChange = Route.indexOf(locFound);
    Route.splice(indexChange, 1, locChanged);
    route.setWaypoints(Route);
    //console.log(snapshot.key);
    return routing(Route, map, route);
  });
}

$(document).ready(function(){
  //addLocation(21.0036985859343, 105.80643995586865);
  //showAllLoction();
  //routing();
  var map = L.map('map').setView([21.001975258290276, 105.8031678199768], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
  }).addTo(map);
  var routeControl = showRoute(map);
  console.log("before update: ", routeControl);
  routeControl = updateData(map, routeControl);
  
  //console.log("after update: ", routeControl);
  //updateData();
  //window.alert("Hello Miracle");
});