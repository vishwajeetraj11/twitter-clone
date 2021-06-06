$(document).ready(() => {
	$.get(`/api/chats/${chatId}`, (data) =>
		$('#chatName').text(getChatName(data))
	);
});

$('#chatNameButton').click(() => {
	const name = $('#chatNameTextbox').val().trim();

	$.ajax({
		url: '/api/chats/' + chatId,
		type: 'PUT',
		data: { chatName: name },
		success: (data, status, xhr) => {
			if (xhr.status != 204) {
				alert('could not update');
			} else {
				location.reload();
			}
		},
	});
});

// Evebt Handler when send button is clicked.
$('.sendMessageButton').click(() => {
	messageSubmitted();
});

$('.inputTextbox').keydown((event) => {
	if (event.which === 13 && !event.shiftKey) {
		messageSubmitted();
		return false;
		// return false does'nt allow a new line in text area on enter  press
	}
});

function messageSubmitted() {
	console.log('submiited');
}

function messageSubmitted() {
	const content = $('.inputTextbox').val().trim();

	if (content != '') {
		sendMessage(content);
		$('.inputTextbox').val('');
	}
}

function sendMessage(content) {
	console.log(content);
}
