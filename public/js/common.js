// Globals
var cropper;

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
