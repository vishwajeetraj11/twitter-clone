import express from 'express';
const router = express.Router();
import User from '../../models/UserModel.js';
import Notification from '../../models/NotificationModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const __dirname = path.resolve();

const upload = multer({ dest: 'uploads/' });

router.get('/', async (req, res, next) => {
	var searchObj = req.query;

	if (req.query.search !== undefined) {
		searchObj = {
			$or: [
				{ firstName: { $regex: req.query.search, $options: 'i' } },
				{ lastName: { $regex: req.query.search, $options: 'i' } },
				{ username: { $regex: req.query.search, $options: 'i' } },
			],
		};
	}

	User.find(searchObj)
		.then((results) => res.status(200).send(results))
		.catch((error) => {
			console.log(error);
			res.sendStatus(400);
		});
});

router.put('/:userId/follow', async (req, res, next) => {
	const userId = req.params.userId;

	const user = await User.findById(userId);

	if (user == null) return res.sendStatus(404);

	const isFollowing =
		user.followers && user.followers.includes(req.session.user._id);
	const option = isFollowing ? '$pull' : '$addToSet';

	req.session.user = await User.findByIdAndUpdate(
		req.session.user._id,
		{ [option]: { following: userId } },
		{ new: true }
	).catch((error) => {
		console.log(error);
		res.sendStatus(400);
	});

	User.findByIdAndUpdate(userId, {
		[option]: { followers: req.session.user._id },
	}).catch((error) => {
		console.log(error);
		res.sendStatus(400);
	});

	// if user x wasn't following this user and they went ahead and started this request that means they clicked on follow
	if (!isFollowing) {
		await Notification.insertNotification(
			userId,
			req.session.user._id,
			'follow',
			req.session.user._id
		);
	}

	res.status(200).send(req.session.user);
});

router.get('/:userId/following', async (req, res, next) => {
	User.findById(req.params.userId)
		.populate('following')
		.then((results) => {
			res.status(200).send(results);
		})
		.catch((error) => {
			console.log(error);
			res.sendStatus(400);
		});
});

router.get('/:userId/followers', async (req, res, next) => {
	User.findById(req.params.userId)
		.populate('followers')
		.then((results) => {
			res.status(200).send(results);
		})
		.catch((error) => {
			console.log(error);
			res.sendStatus(400);
		});
});

router.post(
	'/profilePicture',
	upload.single('croppedImage'),
	async (req, res, next) => {
		if (!req.file) {
			console.log('No file uploaded with ajax request.');
			return res.sendStatus(400);
		}

		var filePath = `/uploads/images/${req.file.filename}.png`;
		var tempPath = req.file.path;
		var targetPath = path.join(__dirname, `${filePath}`);

		fs.rename(tempPath, targetPath, async (error) => {
			if (error != null) {
				console.log(error);
				return res.sendStatus(400);
			}

			req.session.user = await User.findByIdAndUpdate(
				req.session.user._id,
				{ profilePic: filePath },
				{ new: true }
			);

			res.sendStatus(200);
		});
	}
);

router.post(
	'/coverPhoto',
	upload.single('croppedImage'),
	async (req, res, next) => {
		if (!req.file) {
			console.log('No file uploaded with ajax request.');
			return res.sendStatus(400);
		}

		var filePath = `/uploads/images/${req.file.filename}.png`;
		var tempPath = req.file.path;
		var targetPath = path.join(__dirname, `${filePath}`);

		fs.rename(tempPath, targetPath, async (error) => {
			if (error != null) {
				console.log(error);
				return res.sendStatus(400);
			}

			req.session.user = await User.findByIdAndUpdate(
				req.session.user._id,
				{ coverPhoto: filePath },
				{ new: true }
			);

			res.sendStatus(200);
		});
	}
);

export default router;
