$(document).ready(() => {
	$.get('/api/tweets', (tweets) => {
		outputPosts(tweets, $('.postsContainer'));
	});
});


