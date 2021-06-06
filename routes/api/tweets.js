import express from 'express';
import User from '../../models/UserModel.js';
import Tweet from '../../models/TweetModel.js';
import Notification from '../../models/NotificationModel.js';

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

router.post('/', async (req, res, next) => {
	if (!req.body.content) {
		console.log('Content param not sent with request.');
		return res.sendStatus(400);
	}

	const tweetData = {
		content: req.body.content,
		postedBy: req.session.user,
	};

	if (req.body.replyTo) {
		tweetData.replyTo = req.body.replyTo;
	}

	Tweet.create(tweetData)
		.then(async (newTweet) => {
			newTweet = await User.populate(newTweet, { path: 'postedBy' });
			newTweet = await Tweet.populate(newTweet, { path: 'replyTo' });

			if (newTweet.replyTo !== undefined) {
				await Notification.insertNotification(
					newTweet.replyTo.postedBy,
					req.session.user._id,
					'reply',
					newTweet._id
				);
			}

			res.status(201).send(newTweet);
		})
		.catch((error) => {
			console.log(error);
			res.sendStatus(400);
		});
});

router.put('/:id/like', async (req, res, next) => {
	const tweetId = req.params.id;
	const userId = req.session.user._id;
	const isLiked =
		req.session.user && req.session.user.likes.includes(tweetId);

	// addToSet adds to a set
	// $pull removes from a set
	const option = isLiked ? '$pull' : '$addToSet';

	// Insert User Like

	// Add To Array (Likes) : $addToSet - an operator that mongodb has allows to add to a set (a list where an item can exist in it only one time.)

	// User.findByIdAndUpdate(userId, {option: { likes: tweetId }}) // MongoDB doesn't allow this to work
	req.session.user = await User.findByIdAndUpdate(
		userId,
		{ [option]: { likes: tweetId } },
		{ new: true }
	).catch((error) => {
		console.log(error);
		res.sendStatus(400);
	});

	// Insert Tweet Like
	const tweet = await Tweet.findByIdAndUpdate(
		tweetId,
		{ [option]: { likes: userId } },
		{ new: true }
	).catch((error) => {
		console.log(error);
		res.sendStatus(400);
	});

	// isLiked would be false if there was no like which means user logged in has now inserted alike
	if (!isLiked) {
		await Notification.insertNotification(
			tweet.postedBy,
			userId,
			'tweetLike',
			tweet._id
		);
	}

	res.status(200).send(tweet);
});

router.post('/:id/retweet', async (req, res, next) => {
	const tweetId = req.params.id;
	const userId = req.session.user._id;

	// Try and Delete retweet
	const deletedTweet = await Tweet.findOneAndDelete({
		postedBy: userId,
		retweetData: tweetId,
	}).catch((error) => {
		console.log(error);
		res.sendStatus(400);
	});

	const option = deletedTweet !== null ? '$pull' : '$addToSet';

	let retweet = deletedTweet;

	if (retweet === null) {
		retweet = await Tweet.create({
			postedBy: userId,
			retweetData: tweetId,
		}).catch((error) => {
			console.log(error);
			res.sendStatus(400);
		});
	}

	// // Insert User Retweet
	req.session.user = await User.findByIdAndUpdate(
		userId,
		{ [option]: { retweets: retweet._id } },
		{ new: true }
	).catch((error) => {
		console.log(error);
		res.sendStatus(400);
	});

	// // Insert Tweet Retweet
	const tweet = await Tweet.findByIdAndUpdate(
		tweetId,
		{ [option]: { retweetUsers: userId } },
		{ new: true }
	).catch((error) => {
		console.log(error);
		res.sendStatus(400);
	});

	// if there is no deletedTweet then it was a retweet not a removal of retweet
	// Send Notification
	if (!deletedTweet) {
		await Notification.insertNotification(
			tweet.postedBy,
			userId,
			'retweet',
			tweet._id
		);
	}

	res.status(200).send(tweet);
});

router.delete('/:id', async (req, res, next) => {
	await Tweet.findByIdAndDelete(req.params.id).catch((error) => {
		console.log(error);
		res.sendStatus(400);
	});
	res.sendStatus(204);
});

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
