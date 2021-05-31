import express from 'express';
import User from '../../models/UserModel.js';
import Tweet from '../../models/TweetModel.js';

const router = express.Router();

router.get('/', (req, res, next) => {});

router.post('/', async (req, res, next) => {
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

export default router;
