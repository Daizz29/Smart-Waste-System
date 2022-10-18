
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
  //var trash_1 = firebase.database().ref("waste/dichvong/trash_1");

  /*const addLocation = (lat, lng) => {
    var newLocation = locationDB.push();
    newLocation.set({
        lat: lat,
        lng: lng,
    });
  };*/


  const showAllLoction = () => {
    
    locationDB.on('value', function(snapshot){
        var Locations = [];
        var marker = [];
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
            show: true
        }).addTo(map);
        route.setWaypoints(Locations);
        for(let i = 0; i< Locations.length;i++){
          marker[i] = L.marker(Locations[i]).addTo(map);
          marker[i].bindPopup("<b>Hello world!</b><br>I am a popup.");
        }
        //marker = L.marker(Locations[0]).addTo(map);
        //marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
    });
    
  }
  // Ham currentState nham hien thi trang thai hien tai cua thung rac va dua vao nut bam cho tuong ung
  const currentState =(initialState) =>{
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
      var stateInit = firebase.database().ref("waste/dich_vong/"+key_value[0]+"/State/");
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
    //addLocation(21.035959179422512, 105.79172918418396);
    showAllLoction();
    //window.alert("Hello");
    map = document.getElementById("map");
    //map.requestFullscreen();
    setInterval(currentState(),100);
    document.getElementById("on-off").addEventListener("click",changeState);
  });

