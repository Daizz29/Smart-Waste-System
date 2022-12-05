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
//const webSocket = require('ws');
//const wss = new WebSocket.Server({server: server});

const wasteController = require('./controllers/wasteController');
const accountController = require('./controllers/accountController');


app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

app.use(express.static('public'));
app.use(session({
    secret: "ai201203AL104101me",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000*3 }
}));

app.get("/", (req, res) =>{
    res.render("main_views/index", {layout: false});
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

io.on('connection', (socket) =>{
    socket.on('control', (msg) => {
        console.log("new message");
        var name = msg.name;
        var state = msg.state;
        console.log(name);
        console.log(state);
        var stateCtrl = "";
        if(state === "open"){
            stateCtrl = false;
        }
        else if(state === "close"){
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

server.listen(3000, async () =>{
    console.log("Server started at port 3000");
    const changeStream = mongoose.model('Waste').watch([]);
    changeStream.on('change', (next) =>{
        console.log(next.documentKey);
        console.log(next.updateDescription.updatedFields);

        io.emit('change stream', {
            id: next.documentKey,
            data: next.updateDescription.updatedFields
        });
        
    });
});

app.use('/waste', wasteController);
app.use('/account', accountController);