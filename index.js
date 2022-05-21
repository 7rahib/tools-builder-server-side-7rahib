const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.y0nuc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        console.log('DB')
    }
    finally {

    }
}

run().catch(console.dir)

app.use(cors());
app.use(express.json());

// ROOT API
app.get('/', (req, res) => {
    res.send('ToolsBuilder server is running')
})

app.listen(port, () => {
    console.log('Listening to ', port)
})