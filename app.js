// Server Config
const express = require('express')
const app = express()
const port = 3000

// Database Config
// mongodb+srv://2000testzigma:z9DvzO32ruU1JS38@cluster0.ebu9jsn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
const { MongoClient, ServerApiVersion } = require('mongodb')
const dbURI = `mongodb+srv://2000testzigma:z9DvzO32ruU1JS38@cluster0.ebu9jsn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const mongo = new MongoClient(dbURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await mongo.connect();
        // Send a ping to confirm a successful connection
        await mongo.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await mongo.close();
    }
}
run().catch(console.dir);

// Google Image Search Config
const googleImages = require('google-images')
const engineID = 'a2854e80f6eb34417'
const apiKey = 'AIzaSyCicc_pSXkowm2I_pk5l6LpHWsUhtMPtwg'
const imageClient = new googleImages(engineID, apiKey)

app.get('/', (req, res) => {
    res.send("To search images: <pre>/api/v1/search-image/</pre> and To get history: <pre>/api/v1/recent</pre>")
})

app.get('/api/v1/search-image/:target', (req, res) => {
    var page = req.query.page ? req.query.page : 1
    var searchQuery = req.params.target;
    var timeSearched = new Date().toISOString()

    imageClient.search(searchQuery, {
        page: page
    }).then(images => {
        // [{
        //     "url": "http://steveangello.com/boss.jpg",
        //     "type": "image/jpeg",
        //     "width": 1024,
        //     "height": 768,
        //     "size": 102451,
        //     "thumbnail": {
        //         "url": "http://steveangello.com/thumbnail.jpg",
        //         "width": 512,
        //         "height": 512
        //     }
        // }]
        if (images.length > 0) {
            mongo.connect().then(client => {
                client
                    .db("sample_mflix")
                    .collection("search_history")
                    .insertOne({
                        searchQuery,
                        timeSearched
                    })
                res.json(images)
            }).catch((err) => {
                res.json('Database error!' + err)
            })
        } else {
            res.json('No image with your query: ' + imageName)
        }
    })
})

app.get('/api/v1/recent', (req, res) => {
    mongo.connect().then(client => {
        client
            .db("sample_mflix")
            .collection("search_history")
            .find({}, { _id: 0 })   // exclude _id field
            .sort({ _id: -1 })      // sort based on _id field in descending order
            .limit(10)
            .toArray()
            .then((docs, err) => {
                if (err) {
                    res.end('Empty history')
                } else {
                    res.json(docs)
                }
            })
    }).catch((err) => {
        res.json('Database error!' + err)
    })
})

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}...`)
})
