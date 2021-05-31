import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const TweetSchema = new Schema(
	{
		content: { type: String, trim: true },
		postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
		pinned: Boolean,
	},
	{ timestamps: true }
);

var Tweet = mongoose.model('Tweet', TweetSchema);
export default Tweet;
