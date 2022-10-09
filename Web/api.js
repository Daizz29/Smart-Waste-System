
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
            //console.log(childSnapshot.val());
        });
        var map = L.map('map').setView([21.035984, 105.791005], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: '© OpenStreetMap'
        }).addTo(map);
        var route = L.Routing.control({
            show: false
        }).addTo(map);
        route.setWaypoints(Locations);
    });
    
  }
  const firstState =() =>{
    var initialState = [];
    locationDB.on('value',function(snapshot){
      snapshot.forEach(function(childSnapshot){
        var sta = childSnapshot.val().State;
        initialState.push(sta);
        //console.log(initialState[0]);
        
      });
      //console.log(initialState);
      var isSelected = document.getElementById('on-off').checked;
      if(isSelected == false && initialState[0] == "close"){
        document.getElementById('on-off').click();
      }
    });
    /*console.log(initialState);
    var isSelected = document.getElementById('on-off').checked;
    if(isSelected == false && initialState[0] == "close"){
      document.getElementById('on-off').click();
    }*/
    //console.log(initialState);
  }
  const  changeState = () =>{
    var trash_state = [];
    locationDB.on('value',function(snapshot){
      snapshot.forEach(function(childSnapshot){
        var state = childSnapshot.val().State;
        trash_state.push(state);
      });
      const postData1 ={
        State:close
      };
      const postData2 ={
        State:open
      };
      if(trash_state[0] == "close"){
        
      }
    });
  }
  

  $(document).ready(function(){
    //addLocation(21.035959179422512, 105.79172918418396);
    showAllLoction();
    //window.alert("Hello");
    map = document.getElementById("map");
    //map.requestFullscreen();
    firstState();
    document.getElementById("on-off").addEventListener("change",changeState);
    //while(false){
    //}
    
  });

