const express = require('express');
const app = express();
const port = process.env.PORT || 1337;
const server = app.listen(port);

const io = require('socket.io')(server);

app.use(express.static('public'));

const rooms = ['room1', 'room2', 'room3', 'room4'];

io.on('connection', (socket) => {
  socket.join('room5', (err) => socket.emit('chat message', 'Joined Room5'));
  socket.emit('chat message', `Connected through WebSocket`);
  socket.on('access_room', (roomID) => {
    //socket.emit('chat message', '2' + roomID);
    /*
    if(Object.keys(socket.rooms) != [socket.id]) {
      socket.emit('chat message', '3' + roomID);
      Object.keys(socket.rooms).map((room) => room != socket.id ? socket.leave(room) : socket.id);
    }
    */
      console.log(rooms.includes(roomID));
      socket.emit('chat message', roomID + ' ' + rooms.include(roomID));
      socket.join(roomID, (err) => {
        socket.emit('chat message', `Joined room ${roomID}`);
      });
    
  });
  socket.on('disconnect', (socket) => {
    console.log("disconnected")
  })
});
