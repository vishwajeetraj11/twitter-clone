import express from 'express';
const router = express.Router();
import Chat from '../models/ChatModel.js';
import User from '../models/UserModel.js';
import mongoose from 'mongoose';

router.get('/', (req, res, next) => {
	res.status(200).render('inboxPage', {
		pageTitle: 'Inbox',
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user),
	});
});

router.get('/new', (req, res, next) => {
	res.status(200).render('newMessage', {
		pageTitle: 'New Message',
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user),
	});
});

router.get('/:chatId', async (req, res, next) => {
	const userId = req.session.user._id;
	const chatId = req.params.chatId;
	const isValidId = mongoose.isValidObjectId(chatId);

	let payload = {
		pageTitle: 'Chat',
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user),
	};

	if (!isValidId) {
		payload.errorMessage =
			'Chat does not exist or you do not have permission to view it.';
		return res.status(200).render('chatPage', payload);
	}

	let chat = await Chat.findOne({
		_id: chatId,
		users: { $elemMatch: { $eq: userId } },
	}).populate('users');

	if (chat === null) {
		// Check if chat id is really user id
		const userFound = await User.findById(chatId);

		if (userFound != null) {
			// get chat using user id
			chat = await getChatByUserId(userFound._id, userId);
		}
	}

	if (chat === null) {
		payload.errorMessage =
			'Chat does not exist or you do not have permission to view it.';
	} else {
		payload.chat = chat;
	}

	res.status(200).render('chatPage', payload);
});

function getChatByUserId(userLoggedInId, otherUserId) {
	// $size:2 = just to make sure size of array 2
	// $all = all of the conditions of met
	// upsert if not found by query then create it
	return Chat.findOneAndUpdate(
		{
			isGroupChat: false,
			users: {
				$size: 2,
				$all: [
					{
						$elemMatch: {
							$eq: mongoose.Types.ObjectId(userLoggedInId),
						},
					},
					{
						$elemMatch: {
							$eq: mongoose.Types.ObjectId(otherUserId),
						},
					},
				],
			},
		},
		{
			// if not found then insert this
			$setOnInsert: {
				users: [userLoggedInId, otherUserId],
			},
		},
		{
			new: true,
			upsert: true,
		}
	).populate('users');
}

export default router;
