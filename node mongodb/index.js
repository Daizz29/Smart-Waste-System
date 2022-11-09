require('./models/db');

const express = require("express");
const path = require("path");
const handlebars = require("handlebars");
const exphbs = require("express-handlebars");
const {allowInsecurePrototypeAccess} = require("@handlebars/allow-prototype-access");
const bodyparser = require("body-parser");

const wasteController = require('./controllers/wasteController');

var app = express();

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

app.use(express.static('public'));

app.get("/", (req, res) =>{
    res.send('<h2> Hello World </h2>');

    
})

app.set('views', path.join(__dirname, '/views/'));

app.engine(
    'hbs',
    exphbs.engine({
        handlebars: allowInsecurePrototypeAccess(handlebars),
        extname: "hbs",
        defaultLayout: "mainLayout",
        layoutsDir: __dirname + "/views/layouts/",
    })
);

app.set("view engine", "hbs");

app.listen(3000, () =>{
    console.log("Server started at port 3000");
});

app.use('/waste', wasteController);