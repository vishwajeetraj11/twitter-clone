import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
	{
		userTo: { type: Schema.Types.ObjectId, ref: 'User' },
		userFrom: { type: Schema.Types.ObjectId, ref: 'User' },
		notificationType: String,
		opened: { type: Boolean, default: false },
		entityId: Schema.Types.ObjectId, // ID of entity ref is not there because it could be anything eg. like a post, comment, new message.etc
	},
	{ timestamps: true }
);

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
