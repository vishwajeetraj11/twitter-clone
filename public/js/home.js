$(document).ready(() => {
	$.get('/api/tweets', { followingOnly: true }, (tweets) => {
		outputPosts(tweets, $('.postsContainer'));
	});
});
