
const express = require('express');
const app = express();
const port = process.env.PORT || 1337;
const server = app.listen(port);

var io = require('socket.io')(server);


app.use(express.static('public'));

io.on('connection', (socket) => {
  io.emit('chat message', "SOCKET.IO IS WORKING");
});

