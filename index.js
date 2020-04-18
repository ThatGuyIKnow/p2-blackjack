const express = require('express');
const app = express();
const port = process.env.PORT || 1337;
const server = app.listen(port);

const io = require('socket.io')(server);

app.use(express.static('public'));

const rooms = [
  {id: 'room1', maxConnections: 1}, 
  {id: 'room2', maxConnections: 2},
  {id: 'room3', maxConnections: 3},
  {id: 'room4', maxConnections: 4},
  {id: 'room5', maxConnections: 5},
  {id: 'room6', maxConnections: 6},
];

io.on('connection', (socket) => {
  socket.send(`Connected through WebSocket`);
  socket.emit('update_rooms', getRoomConnections())

  socket.on('access_room', (roomID) => {
    const room = rooms.find((r) => r.id == roomID);
    const io_room = io.sockets.adapter.rooms[roomID];
    //If the room exist in "rooms" and either the room hasn't been created yet or the room (which has been created) is at less than maximum capacity
    if(room && (!io_room || io_room.length < room.maxConnections)){
      //Leaves existing room(s)
      leaveRooms(socket);
      socket.join(roomID, () => {
        socket.emit('room_control', true);
        io.emit('update_rooms', getRoomConnections());
        socket.send(`Connected to room(s): ${Object.keys(socket.rooms)}`);
      });
    }
  });
  socket.on('disconnect', (socket) => {
    console.log("disconnected");
  })
});

function leaveRooms(socket) {
  Object.keys(socket.rooms).map((room) => {
    if(room != socket.id) {
      socket.leave(room);
    }
  });
}


function getRoomConnections() {
  let arr = [];
  for(let e of rooms) {
    const room = io.sockets.adapter.rooms[e.id];
    if(!room) {
      arr.push({id: e.id, c: 0, maxC: e.maxConnections});
    }
    else {
      arr.push({id: e.id, c: room.length, maxC: e.maxConnections});
    }
  }
  return arr;
}