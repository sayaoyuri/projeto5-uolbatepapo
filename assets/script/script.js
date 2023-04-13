axios.defaults.headers.common['Authorization'] = 'M813n9erPvENXeuGPzKDL1Iu';
let connectionInterval;
let getMessageInterval;
let userName;

function connectionStatus (name) {
  // console.log(connectionInterval);
  axios.post('https://mock-api.driven.com.br/api/vm/uol/status', name)
    .then((response) => {
      // console.log('Response status: - ' + response.data);
    }).catch((error) => {
      if(error.response.status === 400) {
        console.log('Erro status: - ' + error);
        clearInterval(connectionInterval);
        clearInterval(getMessageInterval);
        getUserName();
      }
    });
  }

function enterRoom (name) {
  axios.post('https://mock-api.driven.com.br/api/vm/uol/participants', name)
    .then((response) => {
      if(response.status === 200) {
        console.log('enter room: - ' + response);
        connectionInterval = setInterval(() => {
          connectionStatus(name);
        }, 5000);

        getMessageInterval = setInterval(getMessages, 3000);
      } else {
        getUserName(true);
      }
    }).catch((error) => {
      if(error.response.status === 400) {
        getUserName(true);
      }
    });
  }

function getUserName (invalidUser) {
  let promptMessage;

  invalidUser === true ? promptMessage = 'O nome informado já está em uso, informe outro nome!' : promptMessage = 'Insira o seu nome';

  userName = prompt(promptMessage);

  const name = {
    name: userName
  }

  enterRoom(name);
}

getUserName();

function sendMessage () {
  const content = document.getElementById('messageInput');
  const to = 'Todos';
  const type ='message';

  const message = {
    from: userName,
    to: to,
    text: content.value,
    type: type
  }

  // console.log(message);
  
  axios.post('https://mock-api.driven.com.br/api/vm/uol/messages', message)
    .then((response) => {
      if(response.status === 200) {
        content.value = '';
        getMessages();
      } else {
        window.location.reload();
      }
    }).catch((error) => {
      // console.log(error);
      window.location.reload();
    });
}

function getMessages () {
  axios.get('https://mock-api.driven.com.br/api/vm/uol/messages')
    .then((response) => {
      const messagesContainer = document.querySelector('.message-container');
      messagesContainer.innerHTML = '';

      response.data.forEach((message) => {
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
        } else if(message.type === 'private_message') {
          messagesContainer.innerHTML += `
            <li data-test='message' class='private'>
              <p>
                <time datetime="${message.time}">${message.time}</time>
                <span>${message.from} </span> enviou mensagem reservadamente para <span>${message.to}</span> 
              </p>
            </li>
          `;
          // ${message.text}
        }
    
      });
    }).catch((error) => {
      console.log(error);
    })
}