$(document).ready(() => {
	$.get('/api/notifications', (data) => {
		outputNotificationList(data, $('.resultsContainer'));
	});
});

$('#markNotificationsAsRead').click(() => markNotificationsAsOpened());

function outputNotificationList(notifications, container) {
	notifications.forEach((notification) => {
		const html = createNotificationHtml(notification);
		container.append(html);
	});

	if (notifications.length == 0) {
		container.append("<span class='noResults'>Nothing to show.</span>");
	}
}

function createNotificationHtml(notification) {
	let userFrom = notification.userFrom;
	let text = getNotificationText(notification);
	let href = getNotificationUrl(notification);
	const className = notification.opened ? '' : 'active';

	return `<a href='${href}' class='resultListItem notification ${className}' data-id='${notification._id}'>
                <div class='resultsImageContainer'>
                    <img src='${userFrom.profilePic}'>
                </div>
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='ellipsis'>${text}</span>
                </div>
            </a>`;
}

function getNotificationText(notification) {
	const userFrom = notification.userFrom;

	if (!userFrom.firstName || !userFrom.lastName) {
		return alert('user from data not populated');
	}

	let userFromName = `${userFrom.firstName} ${userFrom.lastName}`;

	let text;

	if (notification.notificationType == 'retweet') {
		text = `${userFromName} retweeted one of your tweets`;
	} else if (notification.notificationType == 'tweetLike') {
		text = `${userFromName} liked one of your tweets`;
	} else if (notification.notificationType == 'reply') {
		text = `${userFromName} replied to one of your tweets`;
	} else if (notification.notificationType == 'follow') {
		text = `${userFromName} followed you`;
	}

	return `<span class='ellipsis'>${text}</span>`;
}

function getNotificationUrl(notification) {
	let url = '#';

	if (
		notification.notificationType == 'retweet' ||
		notification.notificationType == 'tweetLike' ||
		notification.notificationType == 'reply'
	) {
		url = `/tweets/${notification.entityId}`;
	} else if (notification.notificationType == 'follow') {
		url = `/profile/${notification.entityId}`;
	}

	return url;
}
