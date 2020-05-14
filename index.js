// ======== SETUP ========

const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 1337;
const server = app.listen(port);

const io = require('socket.io')(server);

const solitaire = require("./games/solitaire/solitaire.js");

app.use(express.static('public'));

const options = {

  pingTimeout: 60000, //1 minute(s)
};

const rooms = {

  'room1': {
    id : 'room1',
    connections: [],
    maxConnections: 6,
    state: JSON.parse(fs.readFileSync('testState.json', 'utf-8'))
  },
  'room2': {
    id : 'room2',
    connections: [],
    maxConnections: 6,
    state: {}
  },
  'room3': {
    id : 'room3',
    connections: [],
    maxConnections: 6,
    state: {}
  },
  'room4': {
    id : 'room4',
    connections: [],
    maxConnections: 6,
    state: {}
  },
};

// ======== MIDDLEWARE ========

/**
 * @param {string} data The cookie string
 */

function parseCookie(data) {
  
  console.log(data);
  let parseData = [...data.matchAll(/([^=\s]*)=([^;\s]*)/gm)];

  /* Converts the parsed data to an object with the key-value pairs found in
   * the cookie (match[0] is the entire cookie string).
   */
  let cookie = {};

  for (let match of parseData) {

    cookie[match[1]] = match[2];
  }

  return cookie;
}

/**
 * Takes the default cookie sent by Socket IO and checks if the socket ID sent
 * in the cookie is already in a room in rooms. If yes, then the socket's new
 * ID (which is created on the new connection) replaces the ID in the room.
 *
 * @param {Socket object} socket The socket to call the middleware on
 * @param {function}      next   A callback function
 */
const stickySessionMiddleware = (socket, next) => {

  const cookie = socket.request.headers.cookie;

  if (cookie == undefined) {
    next();
    return;
  }

  const id = parseCookie(cookie)['io'];
  if (id == undefined) {
    next();
    return;
  }

  for (let roomKey of Object.keys(rooms)) {

    const connections = rooms[roomKey].connections;

    if (connections.includes(id)) {

      for (let i = 0; i < connections.length; i++) {

        if (connections[i] == id) {
          connections[i] = socket.id;
          socket.join(roomKey);
        }
      }

      addSocketEventHandlers(socket);
      break;
    }
  }
  next();
};
io.use(stickySessionMiddleware);


// ======== CONNECTION HANDLER ========

/**
 * The on-connection Socket IO handler
 */
io.on('connection', (socket) => {

  socket.send(`Connected through WebSocket. ID: ${socket.id}`);
  //socket.send(`Rooms: ${JSON.stringify(rooms)}`);
  io.send(`Currently ${io.engine.clientsCount} client(s) connected`);

  socket.on('accessRoom', (roomID) => {

    if (!Object.keys(rooms).includes(roomID) ||
      rooms[roomID].connections.length >= rooms[roomID].maxConnections) {
      socket.send("Error joining room " + roomID);
    } else {
      leaveRooms(socket);
      socket.join(roomID);
      rooms[roomID].connections.push(socket.id);
      addSocketEventHandlers(socket);
      //socket.send(`Rooms: ${JSON.stringify(rooms)}`);
    }
  });

  socket.on('disconnect', () => {
    console.log("disconnected");
  });
});

// ======== EVENT HANDLERS ========

/**
 * Adds the necessary eventhandlers to a socket ( as of now, this only includes
 * eventhandlers for maintaining an connection).
 *
 * @param {Socket object} socket The socket to apply the handlers
 */
function addSocketEventHandlers(socket) {

  //Remove all previous event listeners
  socket.removeAllListeners('player action');
  socket.removeAllListeners('reset game');

  // Disconnects the client if a ping hasn't been send in pingTimeout ms
  let sessionDrop = setTimeout(dropSession, options.pingTimeout, socket);

  socket.on('session ping', () => {
    clearTimeout(sessionDrop);
    sessionDrop = setTimeout(dropSession, options.pingTimeout, socket);
  });

  socket.emit('room control');

  addGameEventHandler(socket);
}

/**
 * Adds a game handler for receiving player actions on the state
 *
 * @param {Socket object} socket The socket to apply the handlers
 */
function addGameEventHandler(socket) {

  socket.on('player action', (action, callback) => {

    let room = Object.values(rooms).find((room) =>
      room.connections.includes(socket.id)
    );

    if (room == undefined) return;

    if (Object.keys(room.state).length == 0) {
      solitaire.init((state) => {
        room.state = state;
      });
    } else {
      solitaire.action(room.state, action, (state, err) => {
        if (err) {
          socket.send(err);
        } else {
          room.state = state;
        }
      });
    }
    if(Object.keys(room.state) != 0) {
      const playerState = solitaire.filterState(room.state);
      socket.to(room.id).emit('room update', playerState);
      callback(playerState);
    }
    else {
      io.in(room.id).send("Game has concluded!");
      socket.to(room.id).emit('room update', playerState);
      callback(room.state);
    }
  });

  socket.on('reset game', (callback) => {
    let room = Object.values(rooms).find((room) =>
      room.connections.includes(socket.id)
    );

    solitaire.init((state) => {
      room.state = state;
      socket.to(room.id).emit('room update', state);
      callback(state);
    });
  });
}

// ======== HELPER FUNCTION(S) ========

/**
 * Removes a socket from all rooms and disconnects the socket.
 *
 * @param {Socket object} socket The socket to drop
 */
function dropSession(socket) {

  leaveRooms(socket);

  if (socket.connected) {
    socket.send(`Disconnected from Socket IO Session`);
    //socket.send(`Rooms: ${JSON.stringify(rooms)}`);
    socket.disconnect();
  }
}

/**
 * Removes a socket from all rooms (expect its ID room)
 *
 * @param {Socket object} socket The socket to leave rooms
 */
function leaveRooms(socket) {
  socket.send("LEAVE ROOM FUNCTION ACCESSED")
  for (let roomKey of Object.keys(rooms)) {

    const room = rooms[roomKey];

    if (room.connections.includes(socket.id)) {
      socket.leave(roomKey);
      room.connections = room.connections.filter((e) => e != socket.id);
    }
  }
}
