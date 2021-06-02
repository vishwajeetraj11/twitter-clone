$(document).ready(() => {
	$.get('/api/tweets/' + tweetId, (tweets) => {
		outputPostsWithReplies(tweets, $('.postsContainer'));
	});
});
