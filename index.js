const express = require('express');
const app = express();
const port = process.env.PORT || 1337;
const server = app.listen(port);

const io = require('socket.io')(server);

app.use(express.static('public'));

const options = {
  pingTimeout : 12000, //ms
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

function parseCookie(data) {
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
  next();
}
io.use(stickySessionMiddleware);


io.on('connection', (socket) => {
  socket.emit('chat message', `Connected through WebSocket`);
  socket.emit('chat message', `Rooms: ${JSON.stringify(rooms)}`);
  socket.on('access_room', (roomID) => {
    if (rooms[roomID] != undefined) {
      //Leaves existing room(s)
      Object.keys(socket.rooms).map((room) =>
        room != socket.id ? socket.leave(room) : socket.id);

      socket.join(roomID, (err) => {
        if(err) {
          dropSession(socket);
          return;
        }
        rooms[roomID].connections.push(socket.id);
        socket.emit('chat message', `Rooms: ${JSON.stringify(rooms)}`);

        addSocketEventHandlers(socket);
      });
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
  if(!socket.connected)
    return;
  
  for(let roomKey of Object.keys(rooms)) {
  
    let connections = rooms[roomKey].connections;
    if(connections.includes(socket.id)) {
      rooms[roomKey].connections = connections.filter((conn) => conn != socket.id);
    }
  
  }
  socket.emit('chat message', `Disconnected from Socket IO Session`);
  socket.emit('chat message', `Rooms: ${JSON.stringify(rooms)}`);
  
  socket.disconnect();
}