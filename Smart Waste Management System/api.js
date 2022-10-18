
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

var locationDB = firebase.database().ref("waste/");

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
  var routeArr = [];
  routeArr.push(Route);
  routeArr.push(route);
  return routeArr;
}

function showRoute(map){
  var Locations = [];
  locationDB.on('value', function(snapshot){
    console.log(Locations);
    snapshot.forEach(function(childSnapshot){
      var loc = {key: childSnapshot.key, lat: childSnapshot.val().latitde, lng: childSnapshot.val().longtitde, cap: childSnapshot.val().capacity};
      Locations.push(loc);
    });
    
    var routeArr = routing(Locations, map, null);
    console.log("Initial");
    console.log(routeArr);
    locationDB.on('child_changed', function(snapshot){
      
    });
  }); 
}

const currentState =(initialState) =>{
  var initialState = [];
  locationDB.on('value',function(snapshot){
    snapshot.forEach(function(childSnapshot){
      var sta = childSnapshot.val().state;
      initialState.push(sta);
      //console.log(initialState[0]);
      
    });
    //console.log(initialState);
    var isSelected = document.getElementById('on-off').checked;
    if(isSelected == false && initialState[0] == "close"){
      document.getElementById('on-off').checked = true;
    }else{
      document.getElementById('on-off').checked = false;
    }
  });
}
//ham changeState nham bien doi trang thai cua thung rac khi click vao nut bam
const  changeState = () =>{
  var trash_state = [];
  var key_value =[];
  locationDB.on('value',function(snapshot){
    snapshot.forEach(function(childSnapshot){
      var state = childSnapshot.val().State;
      trash_state.push(state);
      key_value.push(childSnapshot.key);
    });
  });
    console.log(key_value);
    var stateInit = firebase.database().ref("waste/"+key_value[0]+"/state/");
    console.log(trash_state);
    const postData1 = "close";
    const postData2 = "open";
    var change_state = stateInit;
    if(trash_state[0] == "close"){
      change_state.set(postData2);
      document.getElementById('on-off').checked = false;
    }else{
      change_state.set(postData1);
      document.getElementById('on-off').checked = true;
    }
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
  showRoute(map);
  
  setInterval(currentState(),100);
  document.getElementById("on-off").addEventListener("click",changeState);
  //console.log("after update: ", routeControl);
  //updateData();
  //window.alert("Hello Miracle");
});