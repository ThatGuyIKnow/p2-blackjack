
const express = require('express');
const app = express();

var io = require('socket.io')(http);

const port = process.env.PORT;

app.use(express.static('public'));

app.listen(port);
