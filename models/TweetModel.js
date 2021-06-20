import mongoose from 'mongoose';
import Retweet from './RetweetModel.js';

const Schema = mongoose.Schema;

const TweetSchema = new Schema(
	{
		content: { type: String, trim: true },
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		pinned: { type: Boolean, default: false },
		retweet: { type: Schema.Types.ObjectId, ref: 'Tweet' },
		replyTo: { type: Schema.Types.ObjectId, ref: 'Tweet' },
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		timestamps: true,
	}
);

// Virtual Populate List
// TweetSchema.virtual('retweets').get(async function() {
// 	return await Retweet.countDocuments({ tweet: this._id })
// })

const Tweet = mongoose.model('Tweet', TweetSchema);
export default Tweet;
