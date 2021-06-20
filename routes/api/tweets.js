import express from 'express';
import User from '../../models/UserModel.js';
import Tweet from '../../models/TweetModel.js';
import Notification from '../../models/NotificationModel.js';
import AppError from '../../utils/AppError.js';
import { catchAsync } from '../../utils/catchAsync.js';
import Like from '../../models/LikeModel.js';
import Retweet from '../../models/RetweetModel.js';

const router = express.Router();

router.get('/:id', async (req, res, next) => {
	let tweetData = await getTweets({ _id: req.params.id });
	tweetData = tweetData[0];

	const results = {
		tweetData: tweetData,
	};

	if (tweetData.replyTo !== undefined) {
		results.replyTo = tweetData.replyTo;
	}

	results.replies = await getTweets({ replyTo: req.params.id });

	res.status(200).send(results);
});

router.get('/', async (req, res, next) => {
	const searchObj = req.query;
	if (searchObj.isReply !== undefined) {
		const isReply = searchObj.isReply === 'true';
		searchObj.replyTo = { $exists: isReply };
		delete searchObj.isReply;
	}

	if (searchObj.search !== undefined) {
		searchObj.content = { $regex: searchObj.search, $options: 'i' }; // i -> case insensitive search
		delete searchObj.search;
	}

	if (searchObj.followingOnly !== undefined) {
		const followingOnly = searchObj.followingOnly === 'true';
		if (followingOnly) {
			const objectIds = [];

			if (!req.session.user.following) {
				req.session.user.following = [];
			}

			req.session.user.following.forEach((user) => {
				objectIds.push(user);
			});

			objectIds.push(req.session.user._id);
			searchObj.postedBy = { $in: objectIds };
		}
		delete searchObj.followingOnly;
	}

	const results = await getTweets(searchObj);
	res.status(200).send(results);
});

// Create Tweet
router.post(
	'/',
	catchAsync(async (req, res, next) => {
		// Tweet content from body
		const { content } = req.body;

		// No content error.
		if (!content) {
			return next(
				new AppError(
					'Please enter something. A Tweet cannot be empty.',
					400
				)
			);
		}

		const newTweet = await Tweet.create({
			content,
			user: req.user._id,
		});

		res.status(201).json({
			status: 'success',
			newTweet,
		});
	})
);

// Toggle Like
router.post('/:tweetId/like', async (req, res, next) => {
	// Tweet To like or unlike
	const tweet = req.params.tweetId;
	// LoggedIn User
	const user = req.user._id;

	const alreadyLiked = await Like.findOne({
		user,
		tweet,
	});

	// Like
	if (!alreadyLiked) {
		const createLike = await Like.create({
			user,
			tweet,
		});
		res.status(201).json({
			status: 'success',
			like: true,
			likeAction: 'liked',
			like: createLike,
		});
		return;
	}

	await Like.findOneAndDelete({
		user,
		tweet,
	});
	res.sendStatus(204);
});

router.post('/:id/retweet', async (req, res, next) => {
	const tweetId = req.params.id;
	const userId = req.user._id;

	// Try and Delete retweet => undo retweet
	const deletedRetweet = await Retweet.findOneAndDelete({
		user: userId,
		tweet: tweetId,
	});
	await Tweet.findOneAndDelete({
		user: userId,
		retweet: tweetId
	})

	// Retweet
	if (!deletedRetweet) {
		await Retweet.create({
			user: userId,
			tweet: tweetId,
		});

		let newTweet = await Tweet.create({
			user: userId,
			retweet: tweetId,
		})
		
		newTweet = await newTweet.populate('retweet').execPopulate();
		newTweet = await newTweet.populate({
			path: 'user',
			select: 'firstName lastName profilePic username' // '+firstName +lastName +profilePic -username' - Exclude Include Populate
		}).execPopulate();

		res.status(201).json({
			status: 'success',
			tweet: newTweet,
		});
		return;
	}

	res.sendStatus(204);
});

router.delete('/:id', async (req, res, next) => {
	await Tweet.findByIdAndDelete(req.params.id).catch((error) => {
		console.log(error);
		res.sendStatus(400);
	});
	res.sendStatus(204);
});

// Pin Tweet
router.put('/:id', async (req, res, next) => {
	if (req.body.pinned !== undefined) {
		await Tweet.updateMany(
			{ postedBy: req.session.user },
			{ pinned: false }
		).catch((error) => {
			console.log(error);
			res.sendStatus(400);
		});
	}

	Tweet.findByIdAndUpdate(req.params.id, req.body)
		.then(() => res.sendStatus(200))
		.catch((error) => {
			console.log(error);
			res.sendStatus(400);
		});
});

async function getTweets(filter) {
	var results = await Tweet.find(filter)
		.populate('postedBy')
		.populate('retweetData')
		.populate('replyTo')
		.sort({ createdAt: -1 })
		.catch((error) => console.log(error));

	results = await User.populate(results, {
		path: 'replyTo.postedBy', // To populate Replies to reply just 	path: 'replyTo.postedBy replyTo.replyTo',
	});

	return await User.populate(results, { path: 'retweetData.postedBy' });
}

export default router;
