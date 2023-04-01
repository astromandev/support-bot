const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const messageContainer = document.getElementById('message-container');

// Function to import the key
async function importKey(key) {
  return await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-CBC', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Function to decrypt the message
async function decryptMessage(key, data) {
  const iv = data.slice(0, 16);
  const encryptedMessage = data.slice(16);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    key,
    encryptedMessage
  );
  return new TextDecoder().decode(decrypted);
}

messageForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = messageInput.value;
  appendMessage('You', message);
  messageInput.value = '';

  const response = await fetch('/api/api-key/v1/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (response.ok) {
    const data = await response.json();
    if (data && data.encryptedResponse) {
      const key = new Uint8Array(/* Your key here as an array of numbers */);
      const importedKey = await importKey(key);
      const encryptedData = new Uint8Array(Object.values(data.encryptedResponse));
      const decryptedResponse = await decryptMessage(importedKey, encryptedData);
      appendMessage('Chatbot', decryptedResponse);
    } else {
      appendMessage('Chatbot', 'Sorry, I could not find a suitable response.');
    }
  } else {
    console.error('Error fetching data from API');
    appendMessage('Chatbot', 'An error occurred while fetching data from the API.');
  }
});

function appendMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add(sender === 'You' ? 'user-message' : 'bot-message');
  messageElement.innerText = `${sender}: ${message}`;
  messageContainer.append(messageElement);
}
