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
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		timestamps: true,
	}
);

// pre('save') is the middleware that runs before your document gets stored in the db. 
// pre('init') gets called on your documents when they are returned from mongodb queries.
// pre('remove') gets called on your documents when they are removed from db.
// TweetSchema.pre('init', function(next) {
//     console.log('Init')
// });

// TweetSchema.pre('remove', function(next) {
// 	console.log('ran')
//     // this.model('Voucher').remove({ user: this._id }, next);
// });

// Virtual Populate List
// TweetSchema.virtual('retweets').get(async function() {
// 	return await Retweet.countDocuments({ tweet: this._id })
// })

const Tweet = mongoose.model('Tweet', TweetSchema);
export default Tweet;
