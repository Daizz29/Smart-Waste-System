const {MongoClient} = require('mongodb');
const stream = require('stream');

async function main(){
    const uri = "mongodb+srv://Miracle:miracle141@cluster0.jzardua.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(uri);

    try{
        await client.connect();

        //await monitorListingUsingEventEmitter(client, 15000);
        //await monitorListingUsingHasNext(client, 15000);
        await monitorListingUsingStreamAPI(client, 15000);
    }catch(e){
        console.error(e);
    }finally{
        await client.close();
    }
}

main().catch(console.error);

/** 
*@param {*} timeInMs
*@param {*} changeStream 
*/
function closeChangeStream(timeInMs = 60000, changeStream){
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Closing the change stream");
            changeStream.close();
            resolve();
        }, timeInMs);
    });
}

async function monitorListingUsingEventEmitter(client, timeInMs = 60000, pipeline = []){
    const collection = client.db("sample_airbnb").collection("listingsAndReviews");
    const changeStream = collection.watch(pipeline);
    changeStream.on('change', (next) =>{
        console.log(next.documentKey);
        console.log(next.updateDescription.updatedFields);
    });
    await closeChangeStream(timeInMs, changeStream);
}

async function monitorListingUsingHasNext(client, timeInMs = 60000, pipeline = []){
    const collection = client.db("sample_airbnb").collection("listingsAndReviews");
    const changeStream = collection.watch(pipeline);
    closeChangeStream(timeInMs, changeStream);
    try{
        while(await changeStream.hasNext()){
            const next = await changeStream.next() 
            console.log(next.documentKey);
            console.log(next.updateDescription.updatedFields);
        }
    }catch(err){
        if(changeStream.closed){
            console.log("Change stream closed!");
        }
        else{
            throw err;
        }
    }
}

async function monitorListingUsingStreamAPI(client, timeInMs = 60000, pipeline = []){
    const collection = client.db("sample_airbnb").collection("listingsAndReviews");
    const changeStream = collection.watch(pipeline);
    changeStream.stream().pipe(
        new stream.Writable({
            objectMode: true,
            write: function(doc, _, cb){
                console.log(doc.documentKey);
                console.log(doc.updateDescription.updatedFields);
                cb();
            }
        })
    );
    await closeChangeStream(timeInMs, changeStream);
}