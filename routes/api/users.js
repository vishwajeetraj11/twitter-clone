import express from 'express';
const router = express.Router();
import User from '../../models/UserModel.js';
import Follow from '../../models/FollowModel.js';
import Notification from '../../models/NotificationModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { catchAsync } from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';
const __dirname = path.resolve();

const upload = multer({ dest: 'uploads/' });

// Search for users
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

// Toggle Follow
router.post(
	'/:userId/follow',
	catchAsync(async (req, res, next) => {
		// User To follow or unfollow
		const userTo = req.params.userId;
		// LoggedIn User
		const userFrom = req.user._id;

		const alreadyFollows = await Follow.findOne({
			userTo,
			userFrom,
		});

		// Follow
		if (!alreadyFollows) {
			const createFollow = await Follow.create({
				userTo,
				userFrom,
			});
			res.status(201).json({
				status: 'success',
				follow: true,
				followAction: 'followed',
				follow: createFollow,
			});
			return;
		}

		await Follow.findOneAndDelete({
			userTo,
			userFrom,
		});
		res.sendStatus(204);

		// Insert Send Notification to the user who got followed not in case of unfollow
		// // if user x wasn't following this user and they went ahead and started this request that means they clicked on follow
		// if (!isFollowing) {
		// 	await Notification.insertNotification(
		// 		userId,
		// 		req.session.user._id,
		// 		'follow',
		// 		req.session.user._id
		// 	);
		// }

		// res.status(200).send(req.session.user);
	})
);

// Get a user following list
router.get(
	'/:userId/following',
	catchAsync(async (req, res, next) => {
		const userFrom = req.params.userId;

		const following = await Follow.find({ userFrom })
			.select('userTo')
			.populate({
				path: 'userTo',
				select: 'profilePic firstName lastName fullName username _id',
			});

		if (!following) {
			return next(
				new AppError(
					'Cannot get following list, Please try again later.',
					400
				)
			);
		}

		res.status(200).json({
			status: 'success',
			count: following.length,
			following,
		});
	})
);

// Get a user followers list
router.get(
	'/:userId/followers',
	catchAsync(async (req, res, next) => {
		const userTo = req.params.userId;

		const followers = await Follow.find({ userTo })
			.select('userFrom')
			.populate({
				path: 'userFrom',
				select: 'profilePic firstName lastName fullName username _id',
			});

		if (!followers) {
			return next(
				new AppError(
					'Cannot get followers list, Please try again later.',
					400
				)
			);
		}

		res.status(200).json({
			status: 'success',
			count: followers.length,
			followers,
		});
	})
);

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
