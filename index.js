const express = require('express');
const app = express();
const port = process.env.PORT || 1337;
const server = app.listen(port);

const io = require('socket.io')(server);

app.use(express.static('public'));


const rooms = {
  'room1': [], 
  'room2': [], 
  'room3': [], 
  'room4': [], 
};

function parseCookie(data) {
  let parseData =  [...data.matchAll(/([^=\s]*)=([^;\s]*)/gm)];
  let cookie = {};
  for(let match of parseData) {
    cookie[match[1]] = match[2];
  }
  return cookie;
}

io.use((socket, next) => {
  const handshake = socket.request;
  const id = parseCookie(handshake.headers.cookie)['io'];
  console.log(id);
  console.log("socket id before: " + socket.id);
  for(let roomKey of Object.keys(rooms)) {
    if(rooms[roomKey].includes(id)) {
      for(let i = 0; i < rooms[roomKey].length; i++) {
        if(rooms[roomKey][i] == id) {
          rooms[roomKey][i] = socket.id;
          socket.join(roomKey)
        }
      
        let sessionDrop = setTimeout(dropSession, 10000, socket);
        socket.on('session ping', () => {
          clearTimeout(sessionDrop);
          sessionDrop = setTimeout(dropSession, 10000, socket);
        });
      } 
    } 
  }
  next();
});


io.use((socket, next) => {
  const date = new Date();
  date.setTime(date.getTime() + 10000) //10 seconds 
  const cookie = socket.handshake.headers.cookie.replace(/(io=[^;]{1,};)/, 
            () => {return "io=" + socket.id + "; expires="+ date.toUTCString() + ";"});
  console.log(cookie);
  socket.handshake.headers.cookie = cookie;
  next();
});


io.on('connection', (socket) => {
  socket.emit('chat message', `Connected through WebSocket`);
  socket.emit('chat message', `Rooms: ${JSON.stringify(rooms)}`);
  socket.on('access_room', (roomID) => {
    if (rooms[roomID] != undefined) {
      //Leaves existing room(s)
      Object.keys(socket.rooms).map((room) =>
        room != socket.id ? socket.leave(room) : socket.id);

      socket.join(roomID, (err) => {
        if(!err)
        rooms[roomID].push(socket.id);
        socket.emit('chat message', `Rooms: ${JSON.stringify(rooms)}`);
        // Disconnects the client if a ping hasn't been send in 10000 ms
        let sessionDrop = setTimeout(dropSession, 10000, socket);
        socket.on('session ping', () => {
          clearTimeout(sessionDrop);
          sessionDrop = setTimeout(dropSession, 10000, socket);
        });
      });
    }
  });

  socket.on('disconnect', (socket) => {
    console.log("disconnected")
  })
});

function dropSession(socket) {
  if(!socket.connected)
    return;
  for(let roomKey of Object.keys(rooms)) {
    if(rooms[roomKey].includes(socket.id)) {
      rooms[roomKey] = rooms[roomKey].filter((conn) => conn != socket.id);
    }
  }
  socket.emit('chat message', `Disconnected from Socket IO Session`);
  socket.emit('chat message', `Rooms: ${JSON.stringify(rooms)}`);
  socket.disconnect();
}