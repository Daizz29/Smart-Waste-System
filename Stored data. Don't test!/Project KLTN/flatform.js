const {MongoClient} = require('mongodb');
const mqtt = require("mqtt");

async function main(){
    var MQTTclient = mqtt.connect('mqtt://171.244.173.204:1884');
    MQTTclient.on('connect', () =>{
        MQTTclient.subscribe('wasteManagement/#');
    });
    MQTTclient.on('message', async (topic, payload) => {
        console.log('Received Message:', topic, payload.toString());
        let topicArr = topic.split("/");
        let name = topicArr[1];
        const uri = "mongodb+srv://Miracle:miracle141@cluster0.jzardua.mongodb.net/?retryWrites=true&w=majority";
        const client = new MongoClient(uri);
        try{
            await client.connect();
            if(topicArr.length > 2){
                if(topicArr[2] === "status"){
                    let jsonObject = JSON.parse(payload.toString());
                    console.log(jsonObject);
                    var state;
                    if(jsonObject.state === "open"){
                        state = true;
                    }
                    else if(jsonObject.state === "close"){
                        state = false;
                    }
                    var fullness = Number(jsonObject.capacity);
                    await upsertListingByName(client, name, {
                        "latitude": Number(jsonObject.latitude),
                        "longitude": Number(jsonObject.longtitude),
                        "fullness": fullness,
                        "state": state
                    });
                }
            }
        }catch(e){
            console.error(e);
        }finally{
            await client.close();
        }
    });
    
}

main().catch(console.error);

async function upsertListingByName(client, nameOfListing, updatedListing){
    const bin = await client.db("kltn_db").collection("wastes").findOne({
        name: nameOfListing
    });
    if(bin == null){
        const result = await client.db("kltn_db").collection("wastes").insertOne({
            "name": nameOfListing,
            "latitude": updatedListing.latitude,
            "longitude": updatedListing.longitude,
            "capacity": 660,
            "fullness": updatedListing.fullness,
            "state": updatedListing.state,
            "density": [],
            "area_id": "63b4f7d6a8ed20ee251a9831",
            "penalty_time": []
        });
    }
    else{
        const result = await client.db("kltn_db").collection("wastes").updateOne({name: nameOfListing}, {$set: updatedListing}, {upsert: true});
        console.log(`${result.matchedCount} docs matched`);
        if(result.upsertedCount > 0){
            console.log(`A doc was inserted with id ${result.upsertedId}`);
        }
        else{
            console.log(`${result.modifiedCount} docs modified`);
        }
    }
    
}