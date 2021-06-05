import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
			trim: true,
		},
		lastName: {
			type: String,
			required: true,
			trim: true,
		},
		username: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		profilePic: {
			type: String,
			default: '/images/profilePic.png',
		},
		coverPhoto: {
			type: String,
		},
		likes: [{ type: Schema.Types.ObjectId, ref: 'Tweet' }],
		retweets: [{ type: Schema.Types.ObjectId, ref: 'Tweet' }],
		following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model('User', UserSchema);
export default User;
