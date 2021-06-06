import express from 'express';
const router = express.Router();
// import Chat from '../models/ChatModel.js';
// import User from '../models/UserModel.js';
// import mongoose from 'mongoose';

router.get('/', (req, res, next) => {
	res.status(200).render('notificationsPage', {
		pageTitle: 'Notifications',
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user),
	});
});

export default router;
