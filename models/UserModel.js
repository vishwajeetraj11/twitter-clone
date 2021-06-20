import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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
			select: false,
		},
		profilePic: {
			type: String,
			default: '/images/profilePic.png',
		},
		coverPhoto: {
			type: String,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		timestamps: true,
	}
);

// Virtual Populate following List
UserSchema.virtual('following', {
	ref: 'Follow',
	foreignField: 'userFrom',
	localField: '_id'
  });

// Virtual Populate followers List
UserSchema.virtual('followers', {
	ref: 'Follow',
	foreignField: 'userTo',
	localField: '_id'
  });

UserSchema.virtual('fullName').get(function () {
	return this.firstName + ' ' + this.lastName;
});

UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}
	this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function (enteredPassword, userPassword) {
	return await bcrypt.compare(enteredPassword, userPassword);
};

const User = mongoose.model('User', UserSchema);
export default User;
