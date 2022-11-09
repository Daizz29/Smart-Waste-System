const {MongoClient} = require('mongodb');
const mqtt = require("mqtt");



async function main(){
    
    
    

    var MQTTclient = mqtt.connect('mqtt://171.244.173.204:1884');
    MQTTclient.on('connect', () =>{
        MQTTclient.subscribe('wasteManagement/#');
    });
    MQTTclient.on('message', async (topic, payload) => {
        console.log('Received Message:', topic, payload.toString());
        let jsonObject = JSON.parse(payload.toString());
        let topicArr = topic.split("/");
        let name = topicArr[1];
        const uri = "mongodb+srv://Miracle:miracle141@cluster0.jzardua.mongodb.net/?retryWrites=true&w=majority";
        const client = new MongoClient(uri);
        try{
            await client.connect();
            await upsertListingByName(client, name, {
                "latitude": jsonObject.latitude,
                "longtitude": jsonObject.longtitude,
                "capacity": jsonObject.capacity,
                "state": jsonObject.state
            });
        }catch(e){
            console.error(e);
        }finally{
            await client.close();
        }
    });
    
        
        
        /*await createListing(client, {
            name: "Lovely Loft",
            summary: "A charming loft in Paris",
            bedrooms: 1,
            bathrooms: 1
        });*/
        //await findOneListingByName(client, "Lovely Loft");
        /*await findListingsWithMinBedroomsBathroomsAndMostRecentReviews(client, {
            minOfBedrooms: 4,
            minOfBathrooms: 2, 
            maxOfResult: 5
        });*/
        //await upsertListingByName(client, "Miracle Aime", {bedrooms: 1, beds: 2});
        //await updateAllListingToHavePropertyType(client);
        //await updateListingByName(client, "Lovely Loft", {property_type: "Unknown"});
        //await deleteListingByName(client, "Lovely Loft");
        //await deleteListingScrapedBeforeDate(client, new Date("2019-02-15"));
        
    
}

main().catch(console.error);

async function createMultipleListing(client, newListings){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListings);
    console.log(`${result.insertedCount} new listings created with id:`);
    console.log(result.insertedIds);

}

async function createListing(client, newListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
    console.log(`New listing created with id: ${result.insertedId}`);

}

async function findOneListingByName(client, nameOfListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({name: nameOfListing});

    if(result){
        console.log("Found!");
        console.log(result);
    }
    else{
        console.log("Not found!");
    }

}

async function findListingsWithMinBedroomsBathroomsAndMostRecentReviews(client, {
    minOfBedrooms = 0,
    minOfBathrooms = 0, 
    maxOfResult = Number.MAX_SAFE_INTEGER
} = {}){
    const cursor = await client.db("sample_airbnb").collection("listingsAndReviews").find({
        bedrooms: {$gte: minOfBedrooms},
        bathrooms: {$gte: minOfBathrooms}
    }).sort({ last_review: -1}).limit(maxOfResult);

    const results = await cursor.toArray();

    if(results.length > 0){
        console.log("Found listings");
        results.forEach((result, i) => {
            date = new Date(result.last_review).toDateString();
            console.log();
            console.log(`${i+1}. name: ${result.name}`);
            console.log(`  _id: ${result._id}`);
            console.log(`  bedrooms: ${result.bedrooms}`);
            console.log(`  bathrooms: ${result.bathrooms}`);
            console.log(`  most recent review date: ${new Date(result.last_review).toDateString()}`);

        });
    }else{
        console.log("No listing found!");
    }
}

async function updateListingByName(client, nameOfListing, updatedListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne({name: nameOfListing}, {$set: updatedListing});
    console.log(`${result.matchedCount} docs matched`);
    console.log(`${result.modifiedCount} docs modified`);
}

async function upsertListingByName(client, nameOfListing, updatedListing){
    const result = await client.db("sample_airbnb").collection("wastes").updateOne({name: nameOfListing}, {$set: updatedListing}, {upsert: true});
    console.log(`${result.matchedCount} docs matched`);
    if(result.upsertedCount > 0){
        console.log(`A doc was inserted with id ${result.upsertedId}`);
    }
    else{
        console.log(`${result.modifiedCount} docs modified`);
    }
}

async function updateAllListingToHavePropertyType(client){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateMany({property_type: {$exists: false}}, {$set: {property_type: "Unknown"}});
    console.log(`${result.matchedCount} docs matched`);
    console.log(`${result.modifiedCount} docs modified`);
}

async function deleteListingByName(client, nameOfListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteOne({name: nameOfListing});
    console.log(`${result.deletedCount} docs deleted`);
}

async function deleteListingScrapedBeforeDate(client, date){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany({last_scraped: {$lt: date}});
    console.log(`${result.deletedCount} docs deleted`);
}

async function listDB(client){
    const dbList = await client.db().admin().listDatabases();

    console.log("Databases:");
    dbList.databases.forEach(db => {
        console.log(`-${db.name}`);
    });
}