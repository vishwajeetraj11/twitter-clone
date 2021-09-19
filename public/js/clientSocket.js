var connected = false;

// const socket = io();

const socket = io('https://twitter-clone-v1.herokuapp.com/');
// const socket = new WebSocket('ws://localhost:3000');
// var socket = io.connect('http://localhost:3000');

// emit -> broadcasts the fact that that event has been fired
socket.emit('setup', userLoggedIn);
socket.on('connected', () => (connected = true));

socket.on('message received', (newMessage) => messageReceived(newMessage));

socket.on('notification received', (newNotification) => {
	$.get('/api/notifications/latest', (notificationData) => {
		showNotificationPopup(notificationData);
		refreshNotificationsBadge();
	});
});

function emitNotification(userId) {
	if (userId == userLoggedIn._id) return;

	socket.emit('notification received', userId);
}
