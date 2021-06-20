import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const LikeSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User' },
		tweet: { type: Schema.Types.ObjectId, ref: 'Tweet' },
	},
	{ timestamps: true }
);

var Like = mongoose.model('Like', LikeSchema);
export default Like;
