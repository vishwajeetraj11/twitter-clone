import express from 'express';
import User from '../../models/UserModel.js';
import Tweet from '../../models/TweetModel.js';

const router = express.Router();

router.get('/:id', async (req, res, next) => {
	let tweet = await getTweets({ _id: req.params.id });
	tweet = tweet[0];
	res.status(200).send(tweet);
});

router.get('/', async (req, res, next) => {
	var results = await getTweets({});
	res.status(200).send(results);

	// Tweet.find()
	// 	.populate({ path: 'postedBy' }) // populate('postedBy')
	// 	.populate('retweetData')
	// 	.sort({ createdAt: -1 })
	// 	.then(async (tweets) => {
	// 		// Nested Populating

	// 		tweets = await User.populate(tweets, {
	// 			path: 'retweetData.postedBy',
	// 		});

	// 		res.status(200).send(tweets);
	// 	})
	// 	.catch((error) => {
	// 		console.log(error);
	// 		res.sendStatus(400);
	// 	});
});

router.post('/', async (req, res, next) => {
	if (req.body.replyTo) {
		console.log(req.body);
		return res.sendStatus(400);
	}
	if (!req.body.content) {
		console.log('Content param not sent with request.');
		return res.sendStatus(400);
	}

	const tweetData = {
		content: req.body.content,
		postedBy: req.session.user,
	};

	Tweet.create(tweetData)
		.then(async (newTweet) => {
			newTweet = await User.populate(newTweet, { path: 'postedBy' });

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

	res.status(200).send(tweet);
});

async function getTweets(filter) {
	var results = await Tweet.find(filter)
		.populate('postedBy')
		.populate('retweetData')
		.sort({ createdAt: -1 })
		.catch((error) => console.log(error));

	return await User.populate(results, { path: 'retweetData.postedBy' });
}

export default router;
