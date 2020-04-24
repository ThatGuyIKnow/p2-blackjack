const express = require('express');
const app = express();
const port = process.env.PORT || 1337;
const server = app.listen(port);

const io = require('socket.io')(server);

app.use(express.static('public'));

const options = {
  pingTimeout : 60000, //1 minutes
}

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

function parseCookie(data) 
{
  let parseData =  [...data.matchAll(/([^=\s]*)=([^;\s]*)/gm)];
  let cookie = {};
  for(let match of parseData) {
    cookie[match[1]] = match[2];
  }
  return cookie;
}

const stickySessionMiddleware = (socket, next) => {
  const cookie = socket.request.headers.cookie;
  if(cookie == "") {
    next();
    return;
  }

  const id = parseCookie(cookie)['io'];
  for(let roomKey of Object.keys(rooms)) {

    const connections = rooms[roomKey].connections;
    if(connections.includes(id)) {      

      for(let i = 0; i < connections.length; i++) {  
        if(connections[i] == id) {
          connections[i] = socket.id;
          socket.join(roomKey)
        }
      } 

      addSocketEventHandlers(socket);
      break;
    } 
  }
  console.log(io.engine);
  next();
}
io.use(stickySessionMiddleware);

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


function addSocketEventHandlers(socket) 
{
  // Disconnects the client if a ping hasn't been send in pingTimeout ms
  let sessionDrop = setTimeout(dropSession, options.pingTimeout, socket);

  socket.on('session ping', () => {
    clearTimeout(sessionDrop);
    sessionDrop = setTimeout(dropSession, options.pingTimeout, socket);
  });

  socket.emit('room control');
}


function dropSession(socket) 
{
  leaveRooms(socket)
  
  
  if(socket.connected) {
    socket.send(`Disconnected from Socket IO Session`);
    socket.send(`Rooms: ${JSON.stringify(rooms)}`);
    socket.disconnect();
  }
}

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