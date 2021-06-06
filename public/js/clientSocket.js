var connected = false;

// const socket = io();

const socket = io('http://localhost:3000/');
// const socket = new WebSocket('ws://localhost:3000');
// var socket = io.connect('http://localhost:3000');

// emit -> broadcasts the fact that that event has been fired
socket.emit('setup', userLoggedIn);
socket.on('connected', () => (connected = true));

socket.on('message received', (newMessage) => messageReceived(newMessage));
