function createPenTimeChart(arr){
    var xVal = [];
    var yVal = [];
    var colors = [];
    arr.forEach(e => {
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

function createPieChart(allList, time){
    var label = [];
    var value = [];
    var color = [];
    var totalVal = 0;
    allList.forEach(e => {
        label.push(e.name);
        var total = 0;
        e.opDist.forEach(el => {
            total += el.distance;
        });
        value.push(total);
        var randomColor = "#" + Math.floor(Math.random()*16777215).toString(16);
        color.push(randomColor);
        totalVal += total;
    });
    return {
        type: 'doughnut',
        data: {
          labels: label,
          datasets: [
            {
                backgroundColor: color,
                data: value,
            },
          ],
        },
        options: {
            events: false,
            animation: {
                duration: 500,
                easing: "easeOutQuart",
                onComplete: function () {
                    var ctx = this.chart.ctx;
                    ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontFamily, 'normal', Chart.defaults.global.defaultFontFamily);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    console.log(this.data.datasets);
                    this.data.datasets.forEach(function (dataset) {
                        for (var i = 0; i < dataset.data.length; i++) {
                            var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                                total = dataset._meta[Object.keys(dataset._meta)[0]].total,
                                mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius)/2,
                                start_angle = model.startAngle,
                                end_angle = model.endAngle,
                                mid_angle = start_angle + (end_angle - start_angle)/2;
                            var x = mid_radius * Math.cos(mid_angle);
                            var y = mid_radius * Math.sin(mid_angle);
                            ctx.fillStyle = '#fff';
                            var percent = String(Math.round(dataset.data[i]/total*100)) + "%"; 
                            if(dataset.data[i] != 0 && dataset._meta[time].data[i].hidden != true) {
                                ctx.fillText(dataset.data[i], model.x + x, model.y + y);
                                ctx.fillText(percent, model.x + x, model.y + y + 15);
                            }
                        }
                    });               
                }
            }
        },
    }
}
$(document).ready(function(){
    var time = 1;
    new Chart("odChart", createPieChart(list, 0));
    const ulist = document.getElementById("listCar");
    list.forEach(e => {
        const li = document.createElement("li");
        const node = document.createTextNode(e.name);
        li.appendChild(node);
        li.onclick = function(){
            console.log(li.innerHTML);
            var index = list.findIndex(e => e.name === li.innerHTML);
            document.getElementById("odChart").remove();
            var canvas = document.createElement('canvas');
            canvas.setAttribute("id", "odChart");
            canvas.setAttribute("style", "width:100%;max-width:700px;margin-top:100px");
            document.getElementById("opDist").append(canvas);
            new Chart("odChart", createPenTimeChart(list[index].opDist));
            time++;   
        };
        ulist.appendChild(li);
    });
    document.getElementById("overall").onclick = function(){
        document.getElementById("odChart").remove();
        var canvas = document.createElement('canvas');
        canvas.setAttribute("id", "odChart");
        canvas.setAttribute("style", "width:100%;max-width:700px");
        document.getElementById("opDist").append(canvas);
        new Chart("odChart", createPieChart(list, time));
        time++;
    };
});