$(document).ready(() => {
	if (selectedTab === 'replies') {
		loadReplies();
	} else {
		loadPosts();
	}
});

function loadPosts() {
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
