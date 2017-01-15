(function() {

  var output = document.querySelector('.output');
  var inputEmail = document.getElementById('email');
  var inputMessage = document.getElementById('message');
  var btnSend = document.getElementById('btn-enviar');
  var btnLogin = document.getElementById('btn-login');
  var imgAvatar = document.getElementById('avatar');
  var login = document.getElementById('login');
  var author = {name: 'anonymous'};

  function getAvatar(email) {
    var profile = gravatar.getUserProfile(email);
    return profile.replace(/(https:\/\/secure\.gravatar\.com)\/(\w{32})/, '$1/avatar/$2?s=50&d=mm');
  }

  author.avatar = getAvatar(author.name);

  var config = {
    apiKey: 'AIzaSyCL7buZsLVXXQ3Wp7buGEUdlU2qhAPpVwY',
    authDomain: 'beer-js.firebaseio.com',
    databaseURL: 'https://beer-js.firebaseio.com/',
  };
  firebase.initializeApp(config);
  var database = firebase.database();

  function insertData(data) {
    var message = data.val();
    output.innerHTML = '<p data-id="' + message.timestamp + '"><img class="avatar" src="' + message.author.user_image_url + '"><span>' + message.text + '</span></p>' + output.innerHTML;
  }

  // Obtiene los mensajes previos
  database.ref('rooms/beer-js/messages').once('value').then(function (messages) {
    console.log('Load all messages');
  });

  // Escucha nuevos mensajes
  database.ref('rooms/beer-js/messages').on('child_added', insertData);

  inputMessage.addEventListener('keyup', function(e) {
    (e.keyCode || e.charCode) === 13 && sendMessage()
  }, false);
  btnSend.addEventListener('click', sendMessage, false);

  inputEmail.addEventListener('keyup', function(e) {
    (e.keyCode || e.charCode) === 13 && loadAvatar()
  }, false);
  btnLogin.addEventListener('click', loadAvatar, false);

  // Envia nuevos mensajes
  function sendMessage() {
    if (inputMessage.value !== '') {
      var message = {
        author:{
          name: author.name,
          user_image_url: author.avatar
        },
        text: inputMessage.value,
        timestamp: Date.now().toString()
      };
      inputMessage.value = '';
      database.ref('rooms/beer-js/messages').push(message);
    }
  }

  // Envia nuevos mensajes
  function loadAvatar() {
    if (inputEmail.value !== '') {
      var img = getAvatar(inputEmail.value);
      author.name = inputEmail.value;
      author.avatar = img;
      imgAvatar.src = img;
      inputEmail.value = '';
      login.style.display = 'none';
    }
  }

})();
