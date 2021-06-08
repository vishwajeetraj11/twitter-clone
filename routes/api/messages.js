import express from 'express';
import Message from '../../models/MessageModel.js';
import Chat from '../../models/ChatModel.js';
import User from '../../models/UserModel.js';
import Notification from '../../models/NotificationModel.js';

const router = express.Router();
router.post('/', async (req, res, next) => {
	if (!req.body.content || !req.body.chatId) {
		console.log('Invalid data passed into request');
		return res.sendStatus(400);
	}

	const newMessage = {
		sender: req.session.user._id,
		content: req.body.content,
		chat: req.body.chatId,
	};

	Message.create(newMessage)
		.then(async (message) => {
			message = await message.populate('sender').execPopulate();
			message = await message.populate('chat').execPopulate();
			message = await User.populate(message, { path: 'chat.users' });

			const chat = await Chat.findByIdAndUpdate(req.body.chatId, {
				latestMessage: message,
			}).catch((error) => console.log(error));

			insertNotifications(chat, message);

			res.status(201).send(message);
		})
		.catch((error) => {
			console.log(error);
			res.sendStatus(400);
		});
});

function insertNotifications(chat, message) {
	chat.users.forEach((userId) => {
		if (userId == message.sender._id.toString()) return;

		Notification.insertNotification(
			userId,
			message.sender._id,
			'newMessage',
			message.chat._id
		);
	});
}

export default router;
