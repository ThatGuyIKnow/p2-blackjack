
const express = require('express');
const app = express();
const server = app.listen(port);

var io = require('socket.io')(server);

const port = process.env.PORT || 1337;

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.emit('chat message', "SOCKET.IO IS WORKING");
});

