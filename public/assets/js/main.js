const sendButton = document.querySelector('#sendButton');
const inputText = document.querySelector('#inputText');
const messagesContainer = document.querySelector('.chat__messages');
const userId = Date.now() + Math.floor(777 + Math.random() * 7000);

const sendMessage = async (event) => {
  event.preventDefault();  
  const userMessage = inputText.value.trim();
  if (!userMessage) return;

  messagesContainer.innerHTML += `<div class="chat__message chat__message--user">${userMessage}</div>`;
  inputText.value = '';

  messagesContainer.innerHTML += `<div class="chat__message chat__message--bot chat__message--typing">Typing...</div>`;
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    // const response = await fetch('http://localhost/api/chatbot:3000');
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        message: userMessage
      })
    });

    const data = await response.json();
    document.querySelector('.chat__message--typing').remove();
    messagesContainer.innerHTML += `<div class="chat__message chat__message--bot">${data.reply}</div>`;
  } catch (error) {
    console.error('Error:', error);
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

sendButton.addEventListener('click', sendMessage);
inputText.addEventListener('keypress', (event => {
  if(event.key !== 'Enter') return;
  sendMessage(event);
}));
