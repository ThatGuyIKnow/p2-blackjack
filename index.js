
const express = require('express');
const app = express();
const port = process.env.PORT;

app.static(express.static('public'));


app.listen(port);
