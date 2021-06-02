import express from 'express';
const router = express.Router();
// import User from '../models/UserModel.js';

router.get('/:id', (req, res, next) => {
	var payload = {
		pageTitle: 'View post',
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user),
		tweetId: req.params.id,
	};

	res.status(200).render('postPage', payload);
});

export default router;
