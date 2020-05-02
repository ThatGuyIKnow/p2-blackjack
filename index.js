const express = require('express');
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
    connections: [],
    maxConnections: 1,
    state: {
      f_pile : [
      [
          { suit: 'spades', rank: 1, id: 1, isJoker: false, hidden: false },
          { suit: 'spades', rank: 2, id: 2, isJoker: false, hidden: false },
        ],
      [],
      [],
      []
      ],
      t_pile : [
      [  
          { suit: 'hearts', rank: 9, id: 22, isJoker: false, hidden: false },
          { suit: 'spades', rank: 8, id: 8, isJoker: false, hidden: false },
        ],
      [
          { suit: 'spades', rank: 3, id: 3, isJoker: false, hidden: false },
      ],
      [
        { suit: 'diamonds', rank: 9, id: 48, isJoker: false, hidden: false },
      ],
      [
        { suit: 'clubs', rank: 9, id: 35, isJoker: false, hidden: false },
      ],
      [
        { suit: 'clubs', rank: 10, id: 36, isJoker: false, hidden: false },
      ],
      [
        { suit: 'hearts', rank: 13, id: 16, isJoker: false, hidden: false },
        { suit: 'spades', rank: 12, id: 16, isJoker: false, hidden: false },
      ],
      [],
      ],
      s_pile : [
      { suit: 'clubs', rank: 1, id: 27, isJoker: false, hidden: false },
      { suit: 'hearts', rank: 7, id: 20, isJoker: false, hidden: false },
      { suit: 'hearts', rank: 6, id: 19, isJoker: false, hidden: false },
      { suit: 'diamonds', rank: 2, id: 41, isJoker: false, hidden: false },
      { suit: 'hearts', rank: 2, id: 15, isJoker: false, hidden: false },
      { suit: 'diamonds', rank: 13, id: 52, isJoker: false, hidden: false },
      { suit: 'hearts', rank: 12, id: 25, isJoker: false, hidden: false },
      { suit: 'hearts', rank: 11, id: 24, isJoker: false, hidden: false },
      { suit: 'diamonds', rank: 11, id: 50, isJoker: false, hidden: false },
      { suit: 'hearts', rank: 10, id: 23, isJoker: false, hidden: false },
      { suit: 'spades', rank: 5, id: 5, isJoker: false, hidden: false },
      { suit: 'diamonds', rank: 5, id: 44, isJoker: false, hidden: false },
      { suit: 'spades', rank: 7, id: 7, isJoker: false, hidden: false },
      { suit: 'hearts', rank: 8, id: 21, isJoker: false, hidden: false },
      { suit: 'diamonds', rank: 4, id: 43, isJoker: false, hidden: false },
      { suit: 'spades', rank: 13, id: 13, isJoker: false, hidden: false },
      { suit: 'clubs', rank: 12, id: 38, isJoker: false, hidden: false },
      { suit: 'hearts', rank: 5, id: 18, isJoker: false, hidden: false },
      { suit: 'diamonds', rank: 7, id: 46, isJoker: false, hidden: false },
      { suit: 'spades', rank: 6, id: 6, isJoker: false, hidden: false },
      { suit: 'clubs', rank: 4, id: 30, isJoker: false, hidden: false },
      { suit: 'clubs', rank: 13, id: 39, isJoker: false, hidden: false },
      { suit: 'diamonds', rank: 8, id: 47, isJoker: false, hidden: false },
      { suit: 'diamonds', rank: 12, id: 51, isJoker: false, hidden: false },
      { suit: 'clubs', rank: 6, id: 32, isJoker: false, hidden: false },
      { suit: 'clubs', rank: 3, id: 29, isJoker: false, hidden: false },
      { suit: 'diamonds', rank: 1, id: 40, isJoker: false, hidden: false },
      { suit: 'clubs', rank: 5, id: 31, isJoker: false, hidden: false },
      { suit: 'spades', rank: 9, id: 9, isJoker: false, hidden: false },
      { suit: 'spades', rank: 11, id: 11, isJoker: false, hidden: false },
      { suit: 'diamonds', rank: 6, id: 45, isJoker: false, hidden: false },
      { suit: 'clubs', rank: 8, id: 34, isJoker: false, hidden: false },
      { suit: 'spades', rank: 4, id: 4, isJoker: false, hidden: false },
      { suit: 'diamonds', rank: 10, id: 49, isJoker: false, hidden: false },
      { suit: 'clubs', rank: 11, id: 37, isJoker: false, hidden: false },
      { suit: 'diamonds', rank: 3, id: 42, isJoker: false, hidden: false },
      { suit: 'hearts', rank: 1, id: 14, isJoker: false, hidden: false },
      { suit: 'hearts', rank: 13, id: 26, isJoker: false, hidden: false },
      { suit: 'clubs', rank: 7, id: 33, isJoker: false, hidden: false },
      { suit: 'spades', rank: 12, id: 12, isJoker: false, hidden: false },
      { suit: 'spades', rank: 10, id: 10, isJoker: false, hidden: false },
      { suit: 'clubs', rank: 2, id: 28, isJoker: false, hidden: false },
      { suit: 'hearts', rank: 4, id: 17, isJoker: false, hidden: false },
      ]	
    }
  },
  'room2': {
    connections: [],
    maxConnections: 1,
    state: {}
  },
  'room3': {
    connections: [],
    maxConnections: 1,
    state: {}
  },
  'room4': {
    connections: [],
    maxConnections: 1,
    state: {}
  },
};

// @param {string} data The cookie string
function parseCookie(data) {
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

/*
 * The on-connection Socket IO handler
 */
io.on('connection', (socket) => {
  socket.send(`Connected through WebSocket. ID: ${socket.id}`);
  socket.send(`Rooms: ${JSON.stringify(rooms)}`);

  socket.on('accessRoom', (roomID) => {

    if (!Object.keys(rooms).includes(roomID) ||
      rooms[roomID].connections.length >= rooms[roomID].maxConnections) {
      socket.send("Error joining room " + roomID);
    } else {
      leaveRooms(socket);
      socket.join(roomID);
      rooms[roomID].connections.push(socket.id);
      addSocketEventHandlers(socket);
      socket.send(`Rooms: ${JSON.stringify(rooms)}`);
    }
  });


  socket.on('disconnect', (socket) => {
    console.log("disconnected");
  });
});


/*
 * Adds the necessary eventhandlers to a socket ( as of now, this only includes
 * eventhandlers for maintaining an connection).
 *
 * @param {Socket object} socket The socket to apply the handlers
 */
function addSocketEventHandlers(socket) {
  // Disconnects the client if a ping hasn't been send in pingTimeout ms
  let sessionDrop = setTimeout(dropSession, options.pingTimeout, socket);

  socket.on('session ping', () => {
    clearTimeout(sessionDrop);
    sessionDrop = setTimeout(dropSession, options.pingTimeout, socket);
  });

  socket.emit('room control');


  socket.on('player action', (action, callback) => {
    let room = rooms[Object.keys(socket.rooms)[1]]; // Probly unstable. Search in rooms const instead
    if (Object.keys(room.state).length == 0) {
      solitaire.init((state) => {
        room.state = state;
        const playerState = solitaire.filterState(state);
        callback(playerState);
      });
    } else {
      solitaire.action(room.state, action, (state, err) => {
        if (err) {
          socket.send(err);
        } else {
          room.state = state;
          callback(state);
        }

      });
    }
  });
}

/*
 * Removes a socket from all rooms and disconnects the socket.
 *
 * @param {Socket object} socket The socket to drop
 */
function dropSession(socket) {
  leaveRooms(socket);


  if (socket.connected) {
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
  for (let roomKey of Object.keys(rooms)) {
    const room = rooms[roomKey];
    if (room.connections.includes(socket.id)) {
      socket.leave(roomKey);
      room.connections = room.connections.filter((e) => e != socket.id);
    }
  }
}
