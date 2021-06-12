// Globals
var cropper;
let timer;
let selectedUsers = [];

$(document).ready(() => {
	refreshMessagesBadge();
	refreshNotificationsBadge();
});

$('#postTextarea, #replyTextarea').keyup((event) => {
	const textbox = $(event.target);
	const value = textbox.val().trim();

	const isModal = textbox.parents('.modal').length === 1;

	const submitButton = isModal
		? $('#submitReplyButton')
		: $('#submitPostButton');

	if (submitButton.length === 0) return alert('No submit button found.');

	if (value === '') {
		submitButton.prop('disabled', true);
		return;
	}

	submitButton.prop('disabled', false);
});

$('#submitPostButton, #submitReplyButton').click((event) => {
	const button = $(event.target);

	const isModal = button.parents('.modal').length === 1;

	const textbox = isModal ? $('#replyTextarea') : $('#postTextarea');

	const data = {
		content: textbox.val(),
	};

	if (isModal) {
		const tweetId = button.data().id;
		if (tweetId === null) return alert('Button id is null');
		data.replyTo = tweetId;
	}

	$.post('/api/tweets', data, (postData, status, xhr) => {
		// Success Callback
		if (postData.replyTo) {
			emitNotification(postData.replyTo.postedBy);
			location.reload();
		} else {
			const html = createPostHtml(postData);
			$('.postsContainer').prepend(html);
			textbox.val('');
			button.prop('disabled', true);
		}
	});
});

$('#replyModal').on('show.bs.modal', (event) => {
	var button = $(event.relatedTarget);
	var postId = getPostIdFromElement(button);

	// Set id of post to submit button in modal in data attribute won't show in dom
	$('#submitReplyButton').data('id', postId);

	$.get('/api/tweets/' + postId, (results) => {
		outputPosts(results.tweetData, $('#originalPostContainer'));
	});
});

$('#replyModal').on('hidden.bs.modal', () =>
	$('#originalPostContainer').html('')
);

$('#deletePostModal').on('show.bs.modal', (event) => {
	var button = $(event.relatedTarget);
	var postId = getPostIdFromElement(button);
	$('#deletePostButton').data('id', postId);
});

// This does work because the button is there at the time when the pages loads in pug
$('#deletePostButton').click((event) => {
	var postId = $(event.target).data('id');

	$.ajax({
		url: `/api/tweets/${postId}`,
		type: 'DELETE',
		success: (data, status, xhr) => {
			if (xhr.status !== 204) {
				alert('Could not delete post!');
				return;
			}

			location.reload();
		},
	});
});

$('#confirmPinModal').on('show.bs.modal', (event) => {
	var button = $(event.relatedTarget);
	var postId = getPostIdFromElement(button);
	$('#pinPostButton').data('id', postId);
});

$('#filePhoto').change(function () {
	if (this.files && this.files[0]) {
		var reader = new FileReader();
		reader.onload = (e) => {
			const image = document.getElementById('imagePreview');
			image.src = e.target.result;

			if (cropper !== undefined) {
				cropper.destroy();
			}

			cropper = new Cropper(image, {
				aspectRatio: 1 / 1,
				background: false,
			});
		};
		reader.readAsDataURL(this.files[0]);
	} else {
		console.log('nope');
	}
});

$('#coverPhoto').change(function () {
	if (this.files && this.files[0]) {
		var reader = new FileReader();
		reader.onload = (e) => {
			const image = document.getElementById('coverPreview');
			image.src = e.target.result;

			if (cropper !== undefined) {
				cropper.destroy();
			}

			cropper = new Cropper(image, {
				aspectRatio: 16 / 9,
				background: false,
			});
		};
		reader.readAsDataURL(this.files[0]);
	}
});

$('#imageUploadButton').click(() => {
	var canvas = cropper.getCroppedCanvas();

	if (canvas == null) {
		alert('Could not upload image. Make sure it is an image file.');
		return;
	}

	canvas.toBlob((blob) => {
		var formData = new FormData();
		formData.append('croppedImage', blob);

		$.ajax({
			url: '/api/users/profilePicture',
			type: 'POST',
			data: formData,
			processData: false, // forces jQuery to not make formdata a string
			contentType: false,
			success: () => location.reload(),
		});
	});
});

$('#coverPhotoButton').click(() => {
	var canvas = cropper.getCroppedCanvas();

	if (canvas == null) {
		alert('Could not upload image. Make sure it is an image file.');
		return;
	}

	canvas.toBlob((blob) => {
		var formData = new FormData();
		formData.append('croppedImage', blob);

		$.ajax({
			url: '/api/users/coverPhoto',
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: () => location.reload(),
		});
	});
});

$('#userSearchTextbox').keydown((event) => {
	clearTimeout(timer);
	var textbox = $(event.target);
	var value = textbox.val();

	// BAckspace Key = keycode 0
	if (value == '' && (event.which === 8 || event.keyCode === 8)) {
		// remove user from selection
		selectedUsers.pop();
		updateSelectedUsersHtml();
		$('.resultsContainer').html('');

		if (selectedUsers.length == 0) {
			$('#createChatButton').prop('disabled', true);
		}

		return;
	}

	timer = setTimeout(() => {
		value = textbox.val().trim();

		if (value == '') {
			$('.resultsContainer').html('');
		} else {
			searchUsers(value);
		}
	}, 1000);
});

$('#createChatButton').click(() => {
	const data = JSON.stringify(selectedUsers);

	$.post('/api/chats', { users: data }, (chat) => {
		if (!chat || !chat._id) return alert('Invalid response from server.');

		window.location.href = `/messages/${chat._id}`;
	});
});

$('#pinPostButton').click((event) => {
	var postId = $(event.target).data('id');

	$.ajax({
		url: `/api/tweets/${postId}`,
		type: 'PUT',
		data: { pinned: true },
		success: (data, status, xhr) => {
			if (xhr.status != 200) {
				alert('could not pin tweet!');
				return;
			}

			location.reload();
		},
	});
});

$('#unpinModal').on('show.bs.modal', (event) => {
	var button = $(event.relatedTarget);
	var postId = getPostIdFromElement(button);
	$('#unpinPostButton').data('id', postId);
});

$('#unpinPostButton').click((event) => {
	var postId = $(event.target).data('id');

	$.ajax({
		url: `/api/tweets/${postId}`,
		type: 'PUT',
		data: { pinned: false },
		success: (data, status, xhr) => {
			if (xhr.status != 200) {
				alert('could not unpin post');
				return;
			}

			location.reload();
		},
	});
});

// This doesn't work because the button is not there at the time when the pages loads
// $('.likeButton').click((event) => {
// 	alert('Button Clicked');
// });

// Like
$(document).on('click', '.likeButton', (event) => {
	const button = $(event.target);
	const postId = getPostIdFromElement(button);

	if (postId === undefined) return;

	// there is no $.put() request
	// $.put('/', )

	$.ajax({
		url: `/api/tweets/${postId}/like`,
		type: 'PUT',
		success: (postData) => {
			button.find('span').text(postData.likes.length || '');
			// userLoggedIn is injected in mainLayout pug and is global
			if (postData.likes.includes(userLoggedIn._id)) {
				button.addClass('active');
				emitNotification(postData.postedBy);
			} else {
				button.removeClass('active');
			}
		},
	});
});

// Retweet
$(document).on('click', '.retweetButton', (event) => {
	const button = $(event.target);
	const postId = getPostIdFromElement(button);

	if (postId === undefined) return;

	// there is no $.put() request
	// $.put('/', )

	$.ajax({
		url: `/api/tweets/${postId}/retweet`,
		type: 'POST',
		success: (postData) => {
			button.find('span').text(postData.retweetUsers.length || '');
			// userLoggedIn is injected in mainLayout pug and is global
			if (postData.retweetUsers.includes(userLoggedIn._id)) {
				button.addClass('active');
				emitNotification(postData.postedBy);
			} else {
				button.removeClass('active');
			}
		},
	});
});

$(document).on('click', '.post', (event) => {
	const element = $(event.target);
	const postId = getPostIdFromElement(element);

	// !element.is('button') makes sure that we are not clicking a button. ex like retweet comment
	if (postId !== undefined && !element.is('button')) {
		window.location.href = '/tweets/' + postId;
	}
});

$(document).on('click', '.followButton', (e) => {
	var button = $(e.target);
	var userId = button.data().user;
	$.ajax({
		url: `/api/users/${userId}/follow`,
		type: 'PUT',
		success: (data, status, xhr) => {
			if (xhr.status === 404) {
				return;
			}
			let difference;
			if (data?.following?.includes(userId)) {
				button.addClass('following');
				button.text('Following');
				difference = 1;
				emitNotification(userId);
			} else {
				button.removeClass('following');
				button.text('Follow');
				difference = -1;
			}

			const followersLabel = $('#followersValue');

			// check if ithe followersValue button exist
			if (followersLabel.length != 0) {
				let followersText = followersLabel.text();
				followersText = parseInt(followersText);
				followersLabel.text(followersText + difference);
			}
		},
	});
});

$(document).on('click', '.notification.active', (e) => {
	const container = $(e.target);
	const notificationId = container.data().id;

	const href = container.attr('href');
	e.preventDefault();

	const callback = () => (window.location = href);
	markNotificationsAsOpened(notificationId, callback);
});

function getPostIdFromElement(element) {
	const isRootElement = element.hasClass('post');
	// closest is a jQuery function that goes up through the tree to find a parent with a specified selector
	const rootElement = isRootElement ? element : element.closest('.post');
	// to get all data attributes .data()
	const postId = rootElement.data().id;

	if (postId === undefined) {
		return alert('Post id undefined');
	}

	return postId;
}

function createPostHtml(postData, largeFont = false) {
	// if (postData) return alert('post object is null');

	const isRetweet = !!postData.retweetData;
	const retweetedBy = isRetweet ? postData.postedBy.username : null;
	postData = isRetweet ? postData.retweetData : postData;

	const postedBy = postData.postedBy;
	const displayName = postedBy.firstName + ' ' + postedBy.lastName;
	const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

	const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id)
		? 'active'
		: '';
	const retweetButtonActiveClass = postData.retweetUsers.includes(
		userLoggedIn._id
	)
		? 'active'
		: '';
	const largeFontClass = largeFont ? 'largeFont' : '';

	let retweetText = '';
	if (isRetweet) {
		retweetText = `<span style="font-weight:600;color:var(--green);">
                        <i class='fas fa-retweet'></i>
						${
							retweetedBy === userLoggedIn.username
								? `You Retweeted`
								: `Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>`
						}
                    </span>`;
	}

	let replyFlag = '';
	if (postData.replyTo && postData.replyTo._id) {
		if (!postData.replyTo._id) {
			return alert('Reply to is not populated');
		} else if (!postData.replyTo.postedBy._id) {
			return alert('Posted by is not populated');
		}

		const replyToUsername = postData.replyTo.postedBy.username;
		replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}<a>
                    </div>`;
	}

	let buttons = '';
	let pinnedPostText = '';
	if (postData.postedBy._id == userLoggedIn._id) {
		let pinnedClass = '';
		let dataTarget = '#confirmPinModal';
		if (postData.pinned === true) {
			pinnedClass = 'active';
			dataTarget = '#unpinModal';
			pinnedPostText =
				"<i class='fas fa-thumbtack'></i> <span>Pinned post</span>";
		}

		buttons = `<button class='pinButton ${pinnedClass}' data-id="${postData._id}" data-toggle="modal" data-target="${dataTarget}"><i class='fas fa-thumbtack'></i></button>
		<button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class='fas fa-times'></i></button>`;
	}

	return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
				<div class='postActionContainer'>
					${retweetText}
				</div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
						<div class='pinnedPostText'>${pinnedPostText}</div>
                        <div class='header'>
                            <a href='/profile/${
								postedBy.username
							}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
							${buttons}
                        </div>
						${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
							<div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class='fas fa-retweet'></i>
									<span>${
										postData?.retweetUsers?.length === 0
											? ' '
											: postData?.retweetUsers?.length
									}</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class='far fa-heart'></i>
									<span>${postData?.likes?.length === 0 ? ' ' : postData?.likes?.length}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {
	var msPerMinute = 60 * 1000;
	var msPerHour = msPerMinute * 60;
	var msPerDay = msPerHour * 24;
	var msPerMonth = msPerDay * 30;
	var msPerYear = msPerDay * 365;

	var elapsed = current - previous;

	if (elapsed < msPerMinute) {
		if (elapsed / 1000 < 30) return 'Just now';

		return Math.round(elapsed / 1000) + ' seconds ago';
	} else if (elapsed < msPerHour) {
		return Math.round(elapsed / msPerMinute) + ' minutes ago';
	} else if (elapsed < msPerDay) {
		return Math.round(elapsed / msPerHour) + ' hours ago';
	} else if (elapsed < msPerMonth) {
		return Math.round(elapsed / msPerDay) + ' days ago';
	} else if (elapsed < msPerYear) {
		return Math.round(elapsed / msPerMonth) + ' months ago';
	} else {
		return Math.round(elapsed / msPerYear) + ' years ago';
	}
}

function outputPosts(tweets, container) {
	container.html('');

	if (!Array.isArray(tweets)) {
		tweets = [tweets];
	}

	tweets.forEach((tweet) => {
		// createPostHtml is defined in common.js
		const html = createPostHtml(tweet);
		container.append(html);
	});

	if (tweets.length === 0) {
		container.append("<span class='noResults'>Nothing to show.</span>");
	}
}

function outputPostsWithReplies(results, container) {
	container.html('');

	if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
		const html = createPostHtml(results.replyTo);
		container.append(html);
	}

	const mainPostHtml = createPostHtml(results.tweetData, true);
	container.append(mainPostHtml);

	results.replies.forEach((result) => {
		const html = createPostHtml(result);
		container.append(html);
	});
}

function createUserHtml(userData, showFollowButton) {
	var name = userData.firstName + ' ' + userData.lastName;
	var isFollowing =
		userLoggedIn.following && userLoggedIn.following.includes(userData._id);
	var text = isFollowing ? 'Following' : 'Follow';
	var buttonClass = isFollowing ? 'followButton following' : 'followButton';

	var followButton = '';
	if (showFollowButton && userLoggedIn._id != userData._id) {
		followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                        </div>`;
	}

	return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class='username'>@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
}

function outputUsers(results, container) {
	container.html('');

	results.forEach((result) => {
		var html = createUserHtml(result, true);
		container.append(html);
	});

	if (results.length == 0) {
		container.append("<span class='noResults'>No results found</span>");
	}
}

function searchUsers(searchTerm) {
	$.get('/api/users', { search: searchTerm }, (results) => {
		outputSelectableUsers(results, $('.resultsContainer'));
	});
}

function outputSelectableUsers(results, container) {
	container.html('');

	results.forEach((result) => {
		// check if any selected user is in search result then return
		if (
			result._id == userLoggedIn._id ||
			selectedUsers.some((u) => u._id == result._id)
		) {
			return;
		}

		var html = createUserHtml(result, false);
		var element = $(html);
		element.click(() => userSelected(result));

		container.append(element);
	});

	if (results.length == 0) {
		container.append("<span class='noResults'>No results found</span>");
	}
}

function userSelected(user) {
	selectedUsers.push(user);
	updateSelectedUsersHtml();
	// Clear Search Box and add focus the text box again
	$('#userSearchTextbox').val('').focus();

	// Search Results Clear
	$('.resultsContainer').html('');

	// Enable Chat Button
	$('#createChatButton').prop('disabled', false);
}

function updateSelectedUsersHtml() {
	var elements = [];

	selectedUsers.forEach((user) => {
		var name = user.firstName + ' ' + user.lastName;
		var userElement = $(`<span class='selectedUser'>${name}</span>`);
		elements.push(userElement);
	});

	$('.selectedUser').remove();
	$('#selectedUsers').prepend(elements);
}

function getChatName(chatData) {
	let chatName = chatData.chatName;

	if (!chatName) {
		let otherChatUsers = getOtherChatUsers(chatData.users);
		let namesArray = otherChatUsers.map(
			(user) => user.firstName + ' ' + user.lastName
		);
		chatName = namesArray.join(', ');
	}

	return chatName;
}

function getOtherChatUsers(users) {
	if (users.length == 1) return users;

	return users.filter((user) => user._id != userLoggedIn._id);
}

function messageReceived(newMessage) {
	if ($(`[data-room="${newMessage.chat._id}"]`).length == 0) {
		// They are not on the chat page if that div is not found
		// Show popup notification
		showMessagePopup(newMessage);
	} else {
		addChatMessageHtml(newMessage);
	}

	refreshMessagesBadge();
}

function markNotificationsAsOpened(notificationId = null, callback = null) {
	if (callback == null) callback = () => location.reload();

	var url =
		notificationId != null
			? `/api/notifications/${notificationId}/markAsOpened`
			: `/api/notifications/markAsOpened`;
	$.ajax({
		url: url,
		type: 'PUT',
		success: () => callback(),
	});
}

function showNotificationPopup(data) {
	const html = createNotificationHtml(data);
	const element = $(html);
	element.hide().prependTo('#notificationList').slideDown('fast');

	setTimeout(() => element.fadeOut(400), 5000);
}

function showMessagePopup(data) {
	if (!data.chat.latestMessage._id) {
		data.chat.latestMessage = data;
	}

	var html = createChatHtml(data.chat);
	var element = $(html);
	element.hide().prependTo('#notificationList').slideDown('fast');

	setTimeout(() => element.fadeOut(400), 5000);
}

function refreshNotificationsBadge() {
	$.get('/api/notifications', { unreadOnly: true }, (data) => {
		var numResults = data.length;
		if (numResults > 0) {
			$('#notificationBadge').text(numResults).addClass('active');
		} else {
			$('#notificationBadge').text('').removeClass('active');
		}
	});
}

function refreshMessagesBadge() {
	$.get('/api/chats', { unreadOnly: true }, (data) => {
		var numResults = data.length;
		if (numResults > 0) {
			$('#messagesBadge').text(numResults).addClass('active');
		} else {
			$('#messagesBadge').text('').removeClass('active');
		}
	});
}

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

function createChatHtml(chatData) {
	var chatName = getChatName(chatData); // TODO
	var image = getChatImageElements(chatData); // TODO
	var latestMessage = getLatestMessage(chatData.latestMessage);

	var activeClass =
		!chatData.latestMessage ||
		chatData.latestMessage.readBy.includes(userLoggedIn._id)
			? ''
			: 'active';

	return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
				${image}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading ellipsis'>${chatName}</span>
                    <span class='subText ellipsis'>${latestMessage}</span>
                </div>
            </a>`;
}

function getChatImageElements(chatData) {
	var otherChatUsers = getOtherChatUsers(chatData.users);

	var groupChatClass = '';
	var chatImage = getUserChatImageElement(otherChatUsers[0]);

	if (otherChatUsers.length > 1) {
		groupChatClass = 'groupChatImage';
		chatImage += getUserChatImageElement(otherChatUsers[1]);
	}

	return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}

function getUserChatImageElement(user) {
	if (!user || !user.profilePic) {
		return alert('User passed into function is invalid');
	}

	return `<img src='${user.profilePic}' alt='User's profile pic'>`;
}

function getLatestMessage(latestMessage) {
	if (latestMessage) {
		const sender = latestMessage.sender;
		return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
	}

	return 'New chat';
}
