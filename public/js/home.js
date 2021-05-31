$(document).ready(() => {
	$.get('/api/tweets', (tweets) => {
		console.log(tweets);
	});
});
