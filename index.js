
const express = require('express');
const app = express();
var http = require('http').createServer(app);

var io = require('socket.io')(http);

const port = process.env.PORT || 1337;

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.emit('chat message', "SOCKET.IO IS WORKING");
});

app.listen(port);
