$(document).ready(function(){
    document.getElementById("id").innerHTML = JSON.stringify(acc._id);
    document.getElementById("username").innerHTML = acc.username;
    if(acc.accType == 1){
        document.getElementById("accType").innerHTML = "Collector";
    }
    else if(acc.accType == 2){
        document.getElementById("accType").innerHTML = "Manager";
    }
    document.getElementById("area").innerHTML = area;


});