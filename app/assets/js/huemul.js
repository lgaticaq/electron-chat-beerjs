(function() {

  var output = document.querySelector('.output');
  var input = document.querySelector('input');
  var button = document.querySelector('button');
  var author = {name: 'lgatica@protonmail.com'};

  function getAvatar(email) {
    var profile = gravatar.getUserProfile(email);
    return profile.replace(/(https:\/\/secure\.gravatar\.com)\/(\w{32})/, '$1/avatar/$2?s=50&d=mm');
  }

  function loadAvatar(image, element) {
    element.src = image;
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

  input.addEventListener('keyup', function(e) {
    (e.keyCode || e.charCode) === 13 && sendMessage()
  }, false);
  button.addEventListener('click', sendMessage, false);

  // Envia nuevos mensajes
  function sendMessage() {
    if (input.value !== '') {
      var message = {
        author:{
          name: author.name,
          user_image_url: author.avatar
        },
        text: input.value,
        timestamp: Date.now().toString()
      };
      input.value = '';
      database.ref('rooms/beer-js/messages').push(message);
    }
  }

})();
