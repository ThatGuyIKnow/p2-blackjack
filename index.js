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
  //'rooms_status' = The status of room connections has changed
  socket.emit('rooms_status', roomsConnections())

  // 'access_room' = socket trying to access a room
  socket.on('access_room', (roomID) => {
    const room = rooms.find((r) => r.id == roomID);
    const io_room = getRoomConnections(roomID);
    //If the room exist in "rooms" and either the room hasn't been created yet or the room (which has been created) is at less than maximum capacity
    if(room && (!io_room || io_room.length < room.maxConnections)){
      //Leaves existing room(s)
      leaveAllRooms(socket);

      socket.join(roomID, (err) => {
        // 'room_control' = was socket allowed access
        if(err) {
          socket.emit('room_control', false);
        }
        else {
          socket.emit('room_control', true);
          socket.send(`Connected to room(s): ${Object.keys(socket.rooms)}`);
          socket.to(roomID).send('A client has joined your room!');
        }
        //'rooms_status' = The status of rooms connections has changed
        io.emit('rooms_status', roomsConnections());
      });
    }
  });
  socket.on('disconnect', () => {
    console.log("disconnected");
  })
});

// Make socket leave all rooms (except its ID-room)
function leaveAllRooms(socket) {
  Object.keys(socket.rooms).map((room) => {
    if(room != socket.id) {
      socket.leave(room);
    }
  });
}

// Creates an array containing all roomID, amount of connections
// and maximum amount of connections.
function roomsConnections() {
  let arr = [];
  for(let e of rooms) {
    const connections = getRoomConnections(e.id);
    if(!connections) {
      arr.push({id: e.id, c: 0, maxC: e.maxConnections});
    }
    else {
      arr.push({id: e.id, c: connections.length, maxC: e.maxConnections});
    }
  }
  return arr;
}

function getRoomConnections(roomID) {
  return io.sockets.adapter.rooms[roomID];
}