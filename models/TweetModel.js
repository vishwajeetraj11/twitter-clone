import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const TweetSchema = new Schema(
	{
		content: { type: String, trim: true },
		postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
		pinned: Boolean,
		likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		retweetUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		retweetData: { type: Schema.Types.ObjectId, ref: 'Tweet' },
		replyTo: { type: Schema.Types.ObjectId, ref: 'Tweet' },
	},
	{ timestamps: true }
);

var Tweet = mongoose.model('Tweet', TweetSchema);
export default Tweet;
