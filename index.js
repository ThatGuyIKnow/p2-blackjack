const express = require('express');
const app = express();
const port = process.env.PORT || 1337;
const server = app.listen(port);

const io = require('socket.io')(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.join('boycott_nestle');
  io.to('boycott_nestle').emit('chat message', "This is a message for the room");
  socket.to('boycott_nestle').emit('chat message', "This is a message for the player");
  socket.on('disconnect', (socket) => {
    console.log("disconnected")
  })
});
