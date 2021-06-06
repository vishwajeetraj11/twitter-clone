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

NotificationSchema.statics.insertNotification = async (
	userTo,
	userFrom,
	notificationType,
	entityId
) => {
	const data = {
		userTo: userTo,
		userFrom: userFrom,
		notificationType: notificationType,
		entityId: entityId,
	};
	// don't send notifications for the same thing again and again for eg. like -> send Notif , unlike then like again -> send Notif (to avoid this spam notification) // delete existing notif of same type
	await Notification.deleteOne(data).catch((error) => console.log(error));
	return Notification.create(data).catch((error) => console.log(error));
};

var Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
