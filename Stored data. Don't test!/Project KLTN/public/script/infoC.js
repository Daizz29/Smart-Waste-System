function createChart(opDis){
    var xVal = [];
    var yVal = [];
    var colors = [];
    opDis.forEach(e => {
        xVal.push(e.date);
        yVal.push(e.distance);
        if(e.distance > 10){
            colors.push("red");
        }
        else if(e.distance >= 5 && e.distance <= 10){
            colors.push("yellow");
        }
        else{
            colors.push("green");
        }
    });
    yVal.push(0);
    var chart = {
        type: "bar",
        data: {
          labels: xVal,
          datasets: [{
            backgroundColor: colors,
            data: yVal
          }]
        },
        options: {
          legend: {display: false},
          title: {display: false}
        }
    };
    return chart;
}

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
    document.getElementById("carid").innerHTML = JSON.stringify(car._id);
    document.getElementById("cap").innerHTML = car.capacity;
    console.log(createChart(car.opDist));
    new Chart("opChart", createChart(car.opDist));

});