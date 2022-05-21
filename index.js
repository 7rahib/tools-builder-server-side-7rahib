const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ROOT API
app.get('/', (req, res) => {
    res.send('ToolsBuilder server is running')
})

app.listen(port, () => {
    console.log('Listening to ', port)
})