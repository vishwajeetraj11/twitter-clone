import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const messageSchema = new Schema(
	{
		sender: { type: Schema.Types.ObjectId, ref: 'User' },
		content: { type: String, trim: true },
		chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
		readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	},
	{ timestamps: true }
);

export default mongoose.model('Message', messageSchema);
