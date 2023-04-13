axios.defaults.headers.common['Authorization'] = 'M813n9erPvENXeuGPzKDL1Iu';
let connectionInterval;
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
        console.log(response);

        text.value = '';
        getMessages();
      }
    });
}

function getMessages () {
  // to implement
}