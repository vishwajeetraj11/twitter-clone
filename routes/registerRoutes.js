import express from 'express';
import User from '../models/UserModel.js';
import bcrypt from 'bcrypt';

const app = express();

const router = express.Router();

router.get('/', (req, res, next) => {
	res.status(200).render('register');
});
router.post('/', async (req, res, next) => {
	const firstName = req.body.firstName.trim();
	const lastName = req.body.lastName.trim();
	const username = req.body.username.trim();
	const email = req.body.email.trim();
	const password = req.body.password;

	const payload = req.body;

	if (firstName && lastName && username && email && password) {
		// Check if there is any user has username or email already taken

		const user = await User.findOne({
			$or: [{ username }, { email }],
		}).catch((error) => {
			console.log(error);
			payload.errorMessage = 'Something went wrong.';
			res.status(200).render('register', payload);
		});

		if (user === null) {
			// No User Found
			const data = req.body;
			data.password = await bcrypt.hash(password, 10);
			User.create(data)
				.then((user) => {
					req.session.user = user;
					return res.redirect('/');
				})
				.catch((e) => {
					console.log(e);
				});
		} else {
			// User Found
			if (email == user.email) {
				payload.errorMessage = 'Email already in use.';
			} else {
				payload.errorMessage = 'Username already in use.';
			}
			res.status(200).render('register', payload);
		}
	} else {
		payload.errorMessage = 'Make sure each field has a valid value.';
		res.status(200).render('register', payload);
	}
});

export default router;
