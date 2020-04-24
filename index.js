const express = require('express');
const app = express();
const port = process.env.PORT || 1337;
const server = app.listen(port);

const io = require('socket.io')(server);

app.use(express.static('public'));

const rooms = {
  'room1': 
  {
    connections : [],
    maxConnections : 1
  }, 
  'room2': 
  {
    connections : [],
    maxConnections : 1
  }, 
  'room3': 
  {
    connections : [],
    maxConnections : 1
  }, 
  'room4': 
  {
    connections : [],
    maxConnections : 1
  }, 
};

io.on('connection', (socket) => {
  socket.emit('chat message', `Connected through WebSocket`);
  socket.emit('chat message', `Rooms joined: ${Object.keys(socket.rooms)}`);
  
  socket.on('accessRoom',(roomID) => {
    if(!Object.keys(rooms).include(roomID) || rooms[roomID].connections.length >= rooms[roomID].maxConnections) {
      socket.send("Error joining room " + roomID);
    }
    else {
      leaveRooms(socket);
      socket.join(roomID);
      AddSocketEventHandlers(socket);
    }
  });
  

  socket.on('disconnect', (socket) => {
    console.log("disconnected")
  })
});

function leaveRooms(socket) {
  for(let roomKey in Object.keys(rooms))
  {
      const room = rooms[roomKey];
    if(room.connections.include(socket.id)) 
    {
      socket.leave(roomKey);
      room.connections = room.connections.filter((e) => e != socket.id);
    }
  }
}