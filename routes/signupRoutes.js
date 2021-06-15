import express from 'express';
import User from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import AppError from '../utils/AppError.js';

const app = express();

const router = express.Router();

router.get('/', (req, res, next) => {
	res.status(200).render('register');
});
router.post('/', async (req, res, next) => {
	const { firstName, lastName, username, email, password } = req.body;

	// Check if the all the details came through the request.
	if (!firstName || !lastName || !username || !email || !password) {
		return next(new AppError('Please send all details.', 400));
	}

	// Check if the user already exists (or email/username is taken)
	const user = await User.findOne({
		$or: [{ username }, { email }],
	});

	if (user) {
		if (user.email === email) {
			return next(
				new AppError('This email is already registered with us.', 409) // 409 Conflict
			);
		}
		else if(user.username === username) {
			return next(
				new AppError('This username is already taken. Please choose another one.', 409) // 409 Conflict
			);
		}
	}

	const newUser = await User.create({
		firstName,
		lastName,
		email,
		password,
		username
	})

});

export default router;
