$(document).ready(() => {
	// Get Chat Room Name
	$.get(`/api/chats/${chatId}`, (data) =>
		$('#chatName').text(getChatName(data))
	);
	// Get Chat Messages
	$.get(`/api/chats/${chatId}/messages`, (data) => {
		console.log(data);
	});
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
	$.post(
		'/api/messages',
		{ content: content, chatId: chatId },
		(data, status, xhr) => {
			if (xhr.status != 201) {
				alert('Could not send message');
				$('.inputTextbox').val(content);
				return;
			}
			addChatMessageHtml(data);
		}
	);
}

function addChatMessageHtml(message) {
	if (!message || !message._id) {
		alert('Message is not valid');
		return;
	}

	const messageDiv = createMessageHtml(message);

	$('.chatMessages').append(messageDiv);
}

function createMessageHtml(message) {
	const isMine = message.sender._id == userLoggedIn._id;
	const liClassName = isMine ? 'mine' : 'theirs';

	return `<li class='message ${liClassName}'>
                <div class='messageContainer'>
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`;
}
