require('./models/db');

const express = require("express");
const path = require("path");
const handlebars = require("handlebars");
const exphbs = require("express-handlebars");
const {allowInsecurePrototypeAccess} = require("@handlebars/allow-prototype-access");
const bodyparser = require("body-parser");
const mongoose = require('mongoose');
var app = express();
const server = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);
const mqtt = require("mqtt");
const session = require("express-session");
const algorithm = require('./algorithm');
const managerRouter = require('./routers/managerRouter');
const collectorRouter = require('./routers/collectorRouter');
const accRouter = require('./routers/accountRouter');
var areaController = require('./controllers/areaController');
var accountController = require('./controllers/accountController');
var carController = require('./controllers/carController');
var wasteController = require('./controllers/wasteController');

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: "ai201203AL104101me",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000*60*3 }
}));

io.on('connection', (socket) =>{
    socket.on('control', (msg) => {
        console.log("new message");
        var name = msg.name;
        var state = msg.state;
        console.log(name);
        console.log(state);
        var stateCtrl = "";
        if(state){
            stateCtrl = false;
        }
        else{
            stateCtrl = true;
        }
        const data = {
            state: stateCtrl
        }
        var MQTTclient = mqtt.connect('mqtt://171.244.173.204:1884');
        MQTTclient.on('connect', () =>{
            MQTTclient.publish('wasteManagement/'+name+'/control', JSON.stringify(data));
            MQTTclient.end();
        });
    });
});

app.get("/", (req, res) =>{
    if(req.session.userid){
        if(req.session.acctype == 2){
            res.redirect("http://localhost:3000/manager");
        }
        else if(req.session.acctype == 1){
            res.redirect("http://localhost:3000/collector");
        }
    }
    else{
        res.render("main_views/index", {layout: false});
    }
})

app.set('views', path.join(__dirname, '/views/'));

app.engine(
    'hbs',
    exphbs.engine({
        handlebars: allowInsecurePrototypeAccess(handlebars),
        extname: "hbs",
        defaultLayout: "mainLayout",
        layoutsDir: __dirname + "/views/layouts/",
        partialsDir: __dirname + "/views/partials/"
    })
);

app.set("view engine", "hbs");

server.listen(3000, async () =>{
    console.log("Server started at port 3000");
    
});

const wasteStream = mongoose.model('Waste').watch([]);
const carStream = mongoose.model('Car').watch([]);
wasteStream.on('change', async (next) =>{
    console.log(next.documentKey);
    console.log(next.updateDescription.updatedFields);

    io.emit('waste change', {
        id: next.documentKey,
        data: next.updateDescription.updatedFields
    });
    var waste = await mongoose.model('Waste').findById(next.documentKey._id);
    var list = await wasteController.getByAreaId(waste.area_id);
    var car = await carController.getByAreaId(waste.area_id);
    var area = await areaController.getById(waste.area_id);
    var path = car[0].routing;
    var index = path.findIndex(e => JSON.stringify(e._id) === JSON.stringify(waste._id));
    var start = car[0].position;
    var dest = {
        latitude: area.location[0],
        longitude: area.location[1]
    };
    if(index != -1){
        if(waste.fullness == 0){
            path.splice(index, 1);
            /*if(path.length == 2 && algorithm.distanceBetween2Node(start, dest) == 0){
                path = [];
            }*/
        }
        else{
            path[index].fullness = waste.fullness;
        }
        await carController.updateRoute(car[0]._id, path);
    }
    else{
        if(waste.fullness >= 70){
            var temp = path;
            path = [start];
            if(algorithm.checkForRouting(list, path)){
                path = await algorithm.routing(path);
                path.push(dest);
                await carController.updateRoute(car[0]._id, path);
            }
            else{
                path = temp;
            }
        }
    }

});

carStream.on('change', async (next) =>{
    if(next.updateDescription.updatedFields.routing != null){
        var dataChange = {
            id: JSON.stringify(next.documentKey._id),
            route: next.updateDescription.updatedFields.routing 
        }
        io.emit('car change', {
            data: dataChange
        });
    }
})

app.use('/manager', managerRouter);
app.use('/collector', collectorRouter);
app.use('/account', accRouter);