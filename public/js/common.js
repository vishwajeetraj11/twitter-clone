$('#postTextarea').keyup((event) => {
	const textbox = $(event.target);
	const value = textbox.val().trim();

	const submitButton = $('#submitPostButton');

	if (submitButton.length === 0) return alert('No submit button found.');

	if (value === '') {
		submitButton.prop('disabled', true);
		return;
	}

	submitButton.prop('disabled', false);
});

$('#submitPostButton').click((event) => {
	const button = $(event.target);
	const textbox = $('#postTextarea');

	const data = {
		content: textbox.val(),
	};

	$.post('/api/tweets', data, (postData, status, xhr) => {
		const html = createPostHtml(postData);
		$('.postsContainer').prepend(html);
		textbox.val('');
		button.prop('disabled', true);
	});
});

function createPostHtml(postData) {
	const postedBy = postData.postedBy;
	const displayName = postedBy.firstName + ' ' + postedBy.lastName;
	const timestamp = postData.createdAt;

	return `<div class='post'>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                        </div>
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
							<div class='postButtonContainer'>
                                <button>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer'>
                                <button>
                                    <i class='fas fa-retweet'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer'>
                                <button>
                                    <i class='far fa-heart'></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}
