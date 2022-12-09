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
                await upsertListingByName(client, name, {
                    "state": JSON.parse(payload.toString())
                });
            }
            else{
                let jsonObject = JSON.parse(payload.toString());
                console.log(jsonObject);
                await upsertListingByName(client, name, {
                    "latitude": jsonObject.latitude,
                    "longtitude": jsonObject.longtitude,
                    "capacity": jsonObject.capacity
                });
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
    const result = await client.db("waste_management_system").collection("wastes").updateOne({name: nameOfListing}, {$set: updatedListing}, {upsert: true});
    console.log(`${result.matchedCount} docs matched`);
    if(result.upsertedCount > 0){
        console.log(`A doc was inserted with id ${result.upsertedId}`);
    }
    else{
        console.log(`${result.modifiedCount} docs modified`);
    }
}