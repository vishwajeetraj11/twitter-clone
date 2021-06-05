$(document).ready(() => {
	if (selectedTab === 'replies') {
		loadReplies();
	} else {
		loadPosts();
	}
});

function loadPosts() {
	$.get(
		'/api/tweets',
		{ postedBy: profileUserId, pinned: true },
		(results) => {
			outputPinnedPost(results, $('.pinnedPostContainer'));
		}
	);

	// profileUserId is in pug template
	$.get(
		'/api/tweets',
		{ postedBy: profileUserId, isReply: false },
		(results) => {
			outputPosts(results, $('.postsContainer'));
		}
	);
}
function loadReplies() {
	$.get(
		'/api/tweets',
		{ postedBy: profileUserId, isReply: true },
		(results) => {
			outputPosts(results, $('.postsContainer'));
		}
	);
}

function outputPinnedPost(results, container) {
	if (results.length == 0) {
		container.hide();
		return;
	}

	container.html('');

	results.forEach((result) => {
		var html = createPostHtml(result);
		container.append(html);
	});
}
