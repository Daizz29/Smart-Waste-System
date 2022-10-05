
const firebaseConfig = {
    apiKey: "AIzaSyBQVS-8tk2dz8fVtUa2xyRce-xLTD8Lw0U",
    authDomain: "study-5d590.firebaseapp.com",
    databaseURL: "https://study-5d590-default-rtdb.firebaseio.com",
    projectId: "study-5d590",
    storageBucket: "study-5d590.appspot.com",
    messagingSenderId: "489961472978",
    appId: "1:489961472978:web:db942d99252971e7cbfe0b",
    measurementId: "G-XW6HCK36N3"
  };

  firebase.initializeApp(firebaseConfig);

  var locationDB = firebase.database().ref("waste/dich_vong/");

  const addLocation = (lat, lng) => {
    var newLocation = locationDB.push();
    newLocation.set({
        lat: lat,
        lng: lng,
    });
  };

  const showAllLoction = () => {
    
    locationDB.on('value', function(snapshot){
        var Locations = [];
        snapshot.forEach(function(childSnapshot){
            var loc = {lat: childSnapshot.val().lat, lng: childSnapshot.val().lng};
            Locations.push(loc);
            console.log(childSnapshot.val());
        });
        var map = L.map('map').setView([21.035959179422512, 105.79172918418396], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
        var route = L.Routing.control({
            show: false
        }).addTo(map);
        route.setWaypoints(Locations);
    });
    
  }

  $(document).ready(function(){
    //addLocation(21.035959179422512, 105.79172918418396);
    showAllLoction();
    //window.alert("Hello");
    map = document.getElementById("map");
    map.requestFullscreen();
  });