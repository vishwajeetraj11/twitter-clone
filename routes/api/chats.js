import express from 'express';
const router = express.Router();
import Chat from '../../models/ChatModel.js';
import User from '../../models/UserModel.js';

router.post('/', async (req, res, next) => {
	if (!req.body.users) {
		console.log('Users param not sent with request');
		return res.sendStatus(400);
	}

	let users = JSON.parse(req.body.users);

	if (users.length == 0) {
		console.log('Users array is empty');
		return res.sendStatus(400);
	}

	users.push(req.session.user);

	const chatData = {
		users: users,
		isGroupChat: true,
	};

	Chat.create(chatData)
		.then((results) => res.status(200).send(results))
		.catch((error) => {
			console.log(error);
			res.sendStatus(400);
		});
});

router.get('/', async (req, res, next) => {
	// $elemMatch = element match
	// find loggedin user in the users array
	Chat.find({ users: { $elemMatch: { $eq: req.session.user._id } } })
		.populate('users')
		.sort({ updatedAt: -1 })
		.then((results) => res.status(200).send(results))
		.catch((error) => {
			console.log(error);
			res.sendStatus(400);
		});
});

router.put('/:chatId', async (req, res, next) => {
	Chat.findByIdAndUpdate(req.params.chatId, req.body)
		.then((results) => res.sendStatus(204))
		.catch((error) => {
			console.log(error);
			res.sendStatus(400);
		});
});

router.get('/:chatId', async (req, res, next) => {
	Chat.findOne({
		_id: req.params.chatId,
		users: { $elemMatch: { $eq: req.session.user._id } },
	})
		.populate('users')
		.then((results) => res.status(200).send(results))
		.catch((error) => {
			console.log(error);
			res.sendStatus(400);
		});
});

export default router;