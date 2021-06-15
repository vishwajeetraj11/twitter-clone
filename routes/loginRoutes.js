import express from 'express';
import User from '../models/UserModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

router.post(
	'/',
	catchAsync(async (req, res, next) => {
		const { username, password } = req.body;

		const user = await User.findOne({
			$or: [{ username }, { email: username }],
		}).select('+password');

		if (!user) {
			return next(
				new AppError('No user found with this Email or Username.', 401)
			);
		}

		const valid = await user.comparePassword(password, user.password);
		
		if (!valid) {
			return next(
				new AppError('Incorrect Email or Password', 404)
			);
		}

		res.status(200).json({
			status: 'success',
			user,
			token: generateToken(user._id),
		});
	})
);

export default router;
