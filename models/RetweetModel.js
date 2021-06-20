import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const RetweetSchema = new mongoose.Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
            required: true
		},
		tweet: {
			type: Schema.Types.ObjectId,
			ref: 'Tweet',
            required: true
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		timestamps: true,
	}
);

RetweetSchema.pre(/^find/, async function(next) {
    this.populate({
      path: 'retweet',
    }).populate({
        path: 'user',
        select: 'profilePic firstName lastName fullName username'
    });
    next();
  });

const Retweet = mongoose.model('Retweet', RetweetSchema);
export default Retweet;
