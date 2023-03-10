import bot from "./asset/bot.png";
import user from "./asset/user.png";

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const heading = document.querySelector('h1');

let loadInterval;


function loader(element) {
  element.textContent = '...';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if(element.textContent === '....'){
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {
      element.textContent += text.charAt(index);
      index++;
    }else {
      clearInterval(interval);
    }
  }, 20)
}

function generateUniqueID() {
  const timeStamp = Date.now();
  const random = Math.random();
  const hexadecimal = random.toString(16);

  return `id-${timeStamp}-${hexadecimal}`;
}

function chatString (isAi, value, uniqueId) {
  
  return (
    `
      <div class = "wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class = "profile">
            <img
              src="${isAi ? bot : user}"
              alt = "${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
  
}

const handleSubmit = async (e) => {
  heading.style.display = 'none';
  e.preventDefault();

  const data = new FormData(form);

  chatContainer.innerHTML += chatString(false, data.get('prompt'), generateUniqueID());

  form.reset();

  const uniqueId = generateUniqueID();
  chatContainer.innerHTML += chatString(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  //fetch data from server

  const response = await fetch('https://codemate-chatgpt.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    })
  })
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);

  }else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong"
    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if(e.keyCode === 13) {
    handleSubmit(e);
  }
});
