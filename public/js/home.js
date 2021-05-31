$(document).ready(() => {
	$.get('/api/tweets', (tweets) => {
		outputPosts(tweets, $('.postsContainer'));
	});
});

function outputPosts(tweets, container) {
	container.html('');

	tweets.forEach((tweet) => {
		// createPostHtml is defined in common.js
		const html = createPostHtml(tweet);
		container.append(html);
	});

	if (tweets.length === 0) {
		container.append("<span class='noResults'>Nothing to show.</span>");
	}
}
