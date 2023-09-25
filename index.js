const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;



// midleWare
app.use(cors())
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u7o1gfd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const menuCollection = client.db("bistroDb").collection("menu");
        const usersCollection = client.db("bistroDb").collection("users");
        const cartCollection = client.db("bistroDb").collection("carts");



        // jwt token
        // app.post('/jwt', (req, res) => {
        //     const user = req.body;
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

        //     res.send({ token })
        // })


        // users related apis

        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)
        })




        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })


        // update Users
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result)
        })
        // users delete
        app.delete('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result)


        })





        // Menu APis
        app.get('/menu', async (req, res) => {
            const result = await menuCollection.find().toArray();
            res.send(result)
        })

        app.post('/menu', async (req, res) => {
            const newItem = req.body;
            const result = await menuCollection.insertOne(newItem)
            res.send(result)
        })


        // Cart collection & apis
        app.get('/carts', async (req, res) => {
            const email = req.query.email;
            // console.log(email)
            if (!email) {
                res.send([]);
            }
            const query = { email: email };
            const result = await cartCollection.find(query).toArray();
            res.send(result);

        })

        app.post('/carts', async (req, res) => {
            const carts = req.body;
            // console.log(carts);
            const result = await cartCollection.insertOne(carts);
            res.send(result)
        })


        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result)


        })






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('boss is running')
})

app.listen(port, () => {
    console.log(`Bistro boss is running on port ${port}`)
})


/**
 * NAMNING CONVENTIONS
 *  USER: userCollection
 * 
 * 
 * */ 