$(document).ready(() => {
	// Get Chat Room Name
	$.get(`/api/chats/${chatId}`, (data) =>
		$('#chatName').text(getChatName(data))
	);
	// Get Chat Messages
	$.get(`/api/chats/${chatId}/messages`, (data) => {
		const messages = [];
		let lastSenderId = '';

		data.forEach((message, index) => {
			var html = createMessageHtml(
				message,
				data[index + 1],
				lastSenderId
			);
			messages.push(html);

			lastSenderId = message.sender._id;
		});

		const messagesHtml = messages.join('');
		addMessagesHtmlToPage(messagesHtml);
		scrollToBottom(false);

		$('.loadingSpinnerContainer').remove();
		$('.chatContainer').css('visibility', 'visible');
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

function addMessagesHtmlToPage(html) {
	$('.chatMessages').append(html);
}

function addChatMessageHtml(message) {
	if (!message || !message._id) {
		alert('Message is not valid');
		return;
	}

	var messageDiv = createMessageHtml(message, null, '');

	addMessagesHtmlToPage(messageDiv);
	scrollToBottom(true);
}

function createMessageHtml(message, nextMessage, lastSenderId) {
	var sender = message.sender;
	var senderName = sender.firstName + ' ' + sender.lastName;

	var currentSenderId = sender._id;
	var nextSenderId = nextMessage != null ? nextMessage.sender._id : '';

	var isFirst = lastSenderId != currentSenderId;
	var isLast = nextSenderId != currentSenderId;

	var isMine = message.sender._id == userLoggedIn._id;
	var liClassName = isMine ? 'mine' : 'theirs';

	var nameElement = '';
	if (isFirst) {
		liClassName += ' first';

		if (!isMine) {
			nameElement = `<span class='senderName'>${senderName}</span>`;
		}
	}

	var profileImage = '';
	if (isLast) {
		liClassName += ' last';
		profileImage = `<img src='${sender.profilePic}'>`;
	}

	var imageContainer = '';
	if (!isMine) {
		imageContainer = `<div class='imageContainer'>
                                ${profileImage}
                            </div>`;
	}

	return `<li class='message ${liClassName}'>
				${imageContainer}
				<div class='messageContainer'>
					${nameElement}
					<span class='messageBody'>
						${message.content}
					</span>
				</div>
			</li>`;
}

function scrollToBottom(animated) {
	var container = $('.chatMessages');
	var scrollHeight = container[0].scrollHeight;

	if (animated) {
		container.animate({ scrollTop: scrollHeight }, 'slow');
	} else {
		container.scrollTop(scrollHeight);
	}
}
