import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const TweetSchema = new Schema(
	{
		content: { type: String, trim: true },
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		pinned: { type: Boolean, default: false },
		retweet: { type: Schema.Types.ObjectId, ref: 'Tweet' },
		replyTo: { type: Schema.Types.ObjectId, ref: 'Tweet' },
	},
	{ timestamps: true }
);

// Virtual Populate retweetUsers List
TweetSchema.virtual('retweetUsers', {
	ref: 'Retweet',
	foreignField: 'tweet',
	localField: '_id'
  });

const Tweet = mongoose.model('Tweet', TweetSchema);
export default Tweet;
