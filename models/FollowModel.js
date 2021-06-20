import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FollowSchema = new mongoose.Schema(
	{
		userTo: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		userFrom: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		timestamps: true,
	}
);

// FollowSchema.pre(/^find/, async function(next) {
//     this.populate({
//       path: 'userTo userFrom',
//       select: 'profilePic firstName lastName fullName username'
//     });

//     next();
//   });

const Follow = mongoose.model('Follow', FollowSchema);
export default Follow;
