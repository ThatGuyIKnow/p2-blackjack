
const express = require('express');
const app = express();
const port = process.env.PORT;

app.use(express.static('public'));


app.listen(port);
