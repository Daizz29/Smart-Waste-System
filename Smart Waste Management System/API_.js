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

  var locationDB = firebase.database().ref();

  const test = () => {
    locationDB.on('value',  function(snapshot){
        snapshot.forEach(function(childSnapshot){
            console.log(childSnapshot.key);
        });
    });
  }

  $(document).ready(function(){
    //addLocation(21.0036985859343, 105.80643995586865);
    //showAllLoction();
    //routing();
    test();
    window.alert("Hello Miracle");
  });