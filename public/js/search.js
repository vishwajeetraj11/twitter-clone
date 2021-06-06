$('#searchBox').keydown((event) => {
	clearTimeout(timer);
	let textbox = $(event.target);
	let value = textbox.val();
	let searchType = textbox.data().search;

	timer = setTimeout(() => {
		value = textbox.val().trim();

		if (value == '') {
			$('.resultsContainer').html('');
		} else {
			search(value, searchType);
		}
	}, 1000);
});

function search(searchTerm, searchType) {
	var url = searchType == 'users' ? '/api/users' : '/api/tweets';

	$.get(url, { search: searchTerm }, (results) => {
		if (searchType == 'users') {
			outputUsers(results, $('.resultsContainer'));
		} else {
			outputPosts(results, $('.resultsContainer'));
		}
	});
}
