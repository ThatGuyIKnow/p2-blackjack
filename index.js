const express = require('express');
const app = express();
const port = process.env.PORT || 1337;
const server = app.listen(port);

const io = require('socket.io')(server);

app.use(express.static('public'));

const rooms = ['room1', 'room2', 'room3', 'room4'];

io.on('connection', (socket) => {
  socket.emit('chat message', Object.keys(socket.rooms));
  socket.on('access_room', (roomID) => {
    if(socket.rooms != [socket.id]) {
      Object.keys(socket.rooms).map((room) => room != socket.id ? socket.leave(room) : socket.id);
    }
    if(rooms.include(roomID)) {
      socket.join(roomID);
      socket.emit('room_control', `Joined room ${roomID}`);
    }
  });
  socket.on('disconnect', (socket) => {
    console.log("disconnected")
  })
});
