const {MongoClient} = require('mongodb')

async function main(){
    const uri = "mongodb+srv://Miracle:miracle141@cluster0.jzardua.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(uri);

    try{
        await client.connect();
        const lovelyLoft = await createListing(client, {
            name: "Lovely Loft",
            summary: "A charming loft in Paris",
            bedrooms: 1,
            bathrooms: 1
        });
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
    }catch(e){
        console.error(e);
    }finally{
        await client.close();
    }
}

main().catch(console.error);

async function createListing(client, newListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
    console.log(`New listing created with id: ${result.insertedId}`);

}