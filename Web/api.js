
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

  var locationDB = firebase.database().ref("location123/");

  const addLocation = (lat, lng) => {
    var newLocation = locationDB.push();
    newLocation.set({
        latitude: lat,
        longitude: lng,
    });
  };

  const showAllLoction = () => {
    
    locationDB.on('value', function(snapshot){
        var Locations = [];
        snapshot.forEach(function(childSnapshot){
            var loc = {lat: childSnapshot.val().latitude, lng: childSnapshot.val().longitude};
            Locations.push(loc);
            console.log(childSnapshot.val());
        });
        var map = L.map('map').setView([21.001975258290276, 105.8031678199768], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
        var route = L.Routing.control({
            show: true
        }).addTo(map);
        route.setWaypoints(Locations);
    });
    
  }

  $(document).ready(function(){
    addLocation(21.04335852336321, 105.81887631760785);
    showAllLoction();
    window.alert("Hello Miracle");
  });