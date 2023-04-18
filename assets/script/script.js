axios.defaults.headers.common['Authorization'] = 'M813n9erPvENXeuGPzKDL1Iu';
let connectionInterval;
let getMessageInterval;
let userName;

// Responsable for keeping the user connected to the chat and checking when he leaves
function connectionStatus (name) {
  axios.post('https://mock-api.driven.com.br/api/vm/uol/status', name) // send the userName to the server, keeping him connected
    .catch((error) => {
      if(error.response.status === 400) { // Stops the application if user is disconnected, return to the begining, asking for the userName
        clearInterval(connectionInterval);
        clearInterval(getMessageInterval);
        getUserName();
      }
    });
  }

// Responsable for joining the user on the chat.
function joinChat (name) {
  axios.post('https://mock-api.driven.com.br/api/vm/uol/participants', name)
    .then((response) => {
      if(response.status === 200) { // Case user is successfully connected, start to send the status every 5s and get messages every 3s
        
        connectionInterval = setInterval(() => {
          connectionStatus(name);
        }, 5000);
        getMessages();

        getMessageInterval = setInterval(getMessages, 3000);
      } else {
        getUserName(true);
      }
    }).catch((error) => { // Case any error is returned, start the program again, asking the userName
      if(error.response.status === 400) {
        getUserName(true);
      }
    });
  }

// Responsable for getting the user's name via prompt and sending it to enter room function
function getUserName (invalidUser) {
  // if the function is being called when userName is already, let the user know on the prompt msg
  let promptMessage;
  invalidUser === true ? promptMessage = 'O nome informado já está em uso, informe outro nome!' : promptMessage = 'Insira o seu nome';

  userName = prompt(promptMessage);

  const name = {
    name: userName
  }

  joinChat(name);
}

getUserName();

// Responsable for sending the user message to the server
function sendMessage () {
  const content = document.getElementById('messageInput');
  const to = 'Todos'; // fixed, because private msg is bonus - destiny userName - for bonus
  const type ='message'; // fixed, because private msg is bonus - private_message - for bonus

  const message = {
    from: userName,
    to: to,
    text: content.value,
    type: type
  }

  axios.post('https://mock-api.driven.com.br/api/vm/uol/messages', message)
    .then((response) => {
      if(response.status === 200) { // if success, clear the input and get the available messages from the server
        getMessages();
        content.value = '';
        content.focus();
      } else {
        window.location.reload();
      }
    }).catch((error) => { // Case any error accours, reload the page, starting the application again 
      window.location.reload();
    });
}

// sendMessage when Enter ispressed
document.querySelector('#messageInput').addEventListener('keypress', ev => ev.keyCode === 13 ? sendMessage() : false);

// Responsable for getting the server messages and redendering them on the page
function getMessages () {
  axios.get('https://mock-api.driven.com.br/api/vm/uol/messages')
    .then((response) => {
      const messagesContainer = document.querySelector('.message-container');
      messagesContainer.innerHTML = ''; // Clear the current msgs on the page

      response.data.forEach((message) => { // Render the current message on the page, according to its type
        if(message.type === 'message') {
          messagesContainer.innerHTML += `
            <li data-test='message'>
              <p>
                <time datetime="${message.time}">${message.time}</time>
                <span>${message.from}</span> para <span>Todos: </span> ${message.text}
              </p>
            </li>
          `;
        } else if(message.type === 'status') {
          messagesContainer.innerHTML += `
            <li data-test='message' class='status'>
              <p>
                <time datetime="${message.time}">${message.time}</time>
                <span>${message.from} </span> ${message.text}
              </p>
            </li>
          `;
        } else if(message.type === 'private_message') { // Dont display the msg content, since it is a bonus feature, not implemented
          messagesContainer.innerHTML += `
            <li data-test='message' class='private'>
              <p>
                <time datetime="${message.time}">${message.time}</time>
                <span>${message.from} </span> reservadamente para <span>${message.to}:</span>
              </p>
            </li>
          `;
        }
      });
      
    }).catch((error) => {
      console.log(error);
    })
}