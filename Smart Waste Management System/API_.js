const mqtt = require("mqtt");
var client = mqtt.connect('mqtt://171.244.173.204:1884');
client.on('connect', () =>{
  console.log("Connected");
  //client.subscribe('wasteManagement');
  //client.publish('wasteManagement/waste2/control', '{"state":"open"}');
});
