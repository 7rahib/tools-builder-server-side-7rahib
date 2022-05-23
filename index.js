const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');


const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.y0nuc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        await client.connect()
        const toolsCollection = client.db('toolsBuilder').collection('tools');
        const userCollection = client.db('toolsBuilder').collection('user');
        const ordersCollection = client.db('toolsBuilder').collection('orders');


        //Getting all tools data
        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })

        // Getting single tool data
        app.get('/tools/:_id', async (req, res) => {
            const _id = req.params._id
            const query = { _id: ObjectId(_id) }
            const tool = await toolsCollection.findOne(query)
            res.send(tool)
        })

        // Updating tool quantity after purchase
        app.put('/tools/:_id', verifyJWT, async (req, res) => {
            const _id = req.params._id
            const filter = { _id: ObjectId(_id) }
            const newQuantity = req.body.quantity
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    quantity: parseInt(newQuantity)
                }
            }
            const result = await toolsCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        // Storing user data in database
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24d' });
            res.send({ result, token });
        })

        // Get all user info
        app.get('/user', verifyJWT, async (req, res) => {
            const query = {}
            const result = await userCollection.find(query).toArray()
            res.send(result)
        })

        // Adding new order
        app.post('/order', async (req, res) => {
            const order = req.body
            const result = await ordersCollection.insertOne(order)
            res.send(result)
        })

        // Getting all order
        app.get('/order', async (req, res) => {
            const result = await ordersCollection.find().toArray()
            res.send(result)
        })

        // Getting all orders of an user
        app.get('/order', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const authEmail = req.decoded.email;
            if (email === authEmail) {
                const query = { email: email };
                const orders = await ordersCollection.find(query).toArray();
                return res.send(orders);
            }
            else {
                return res.status(403).send({ message: 'forbidden access' });
            }
        })
    }
    finally {

    }
}
run().catch(console.dir)

// ROOT API
app.get('/', (req, res) => {
    res.send('ToolsBuilder server is running')
})

app.listen(port, () => {
    console.log('Listening to ', port)
})