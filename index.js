const express = require('express');
const app = express();
const port = process.env.PORT || 1337;
const server = app.listen(port);

const io = require('socket.io')(server);

app.use(express.static('public'));

const options = {
  pingTimeout : 60000, //1 minute(s)
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

// @param {string} data The cookie string
function parseCookie(data) 
{
  let parseData =  [...data.matchAll(/([^=\s]*)=([^;\s]*)/gm)];
 
  /* Converts the parsed data to an object with the key-value pairs found in    
   * the cookie (match[0] is the entire cookie string).
   */
  let cookie = {};
  for(let match of parseData) {
    cookie[match[1]] = match[2];
  }
  return cookie;
}

/*
 * Takes the default cookie sent by Socket IO and checks if the socket ID sent
 * in the cookie is already in a room in rooms. If yes, then the socket's new 
 * ID (which is created on the new connection) replaces the ID in the room.
 * 
 * @param {Socket object} socket The socket to call the middleware on
 * @param {function}      next   A callback function 
 */
const stickySessionMiddleware = (socket, next) => {
  const cookie = socket.request.headers.cookie;
  if(cookie == "") {
    next();
    return;
  }

  const id = parseCookie(cookie)['io'];
  if(id == undefined) {
    next();
    return;
  }

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

/*
 * The on-connection Socket IO handler
 */
io.on('connection', (socket) => {
  socket.send(`Connected through WebSocket. ID: ${socket.id}`);
  socket.send(`Rooms: ${JSON.stringify(rooms)}`);
  
  socket.on('accessRoom',(roomID) => {

    if(!Object.keys(rooms).includes(roomID) || 
          rooms[roomID].connections.length >= rooms[roomID].maxConnections) {
      socket.send("Error joining room " + roomID);
    }
    else {
      leaveRooms(socket);
      socket.join(roomID);
      rooms[roomID].connections.push(socket.id);
      addSocketEventHandlers(socket);
      socket.send(`Rooms: ${JSON.stringify(rooms)}`);
    }
  });
  

  socket.on('disconnect', (socket) => {
    console.log("disconnected")
  })
});


/*
 * Adds the necessary eventhandlers to a socket ( as of now, this only includes 
 * eventhandlers for maintaining an connection).
 *
 * @param {Socket object} socket The socket to apply the handlers
 */
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

/*
 * Removes a socket from all rooms and disconnects the socket.
 *
 * @paran {Socket object} socket The socket to drop
 */
function dropSession(socket) 
{
  leaveRooms(socket)
  
  
  if(socket.connected) {
    socket.send(`Disconnected from Socket IO Session`);
    socket.send(`Rooms: ${JSON.stringify(rooms)}`);
    socket.disconnect();
  }
}

/*
 * Removes a socket from all rooms (expect its ID room)
 *
 * @param {Socket object} socket The socket to leave rooms
 */

function leaveRooms(socket) {
  for(let roomKey of Object.keys(rooms))
  {
    const room = rooms[roomKey];
    if(room.connections.includes(socket.id)) 
    {
      socket.leave(roomKey);
      room.connections = room.connections.filter((e) => e != socket.id);
    }
  }
}