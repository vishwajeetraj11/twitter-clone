import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const TweetSchema = new Schema(
	{
		content: { type: String, trim: true },
		author: { type: Schema.Types.ObjectId, ref: 'User' },
		pinned: { type: Boolean, default: false },
		likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		retweetUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		retweetData: { type: Schema.Types.ObjectId, ref: 'Tweet' },
		replyTo: { type: Schema.Types.ObjectId, ref: 'Tweet' },
	},
	{ timestamps: true }
);

var Tweet = mongoose.model('Tweet', TweetSchema);
export default Tweet;
