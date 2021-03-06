/* global gravatar, firebase */

;(function () {
  var output = document.querySelector('.output')
  var inputEmail = document.getElementById('email')
  var inputUsername = document.getElementById('username')
  var inputMessage = document.getElementById('message')
  var btnSend = document.getElementById('btn-enviar')
  var btnLogin = document.getElementById('btn-login')
  var btnLogout = document.getElementById('btn-logout')
  var imgAvatar = document.getElementById('avatar')
  var divLogin = document.getElementById('login')
  var divLogout = document.getElementById('logout')
  var defaultAvatar =
    'https://secure.gravatar.com/avatar/00000000000000000000000000000000?s=50&d=mm'
  var author = {
    name: localStorage.getItem('username') || 'anonymous',
    avatar: localStorage.getItem('avatar') || defaultAvatar
  }

  if (author.name !== 'anonymous') {
    imgAvatar.src = author.avatar
    divLogin.style.display = 'none'
    divLogout.style.display = 'block'
  }

  var lastMessage
  var md = window.markdownit()

  function getAvatar (email) {
    var profile = gravatar.getUserProfile(email)
    return profile.replace(
      /(https:\/\/secure\.gravatar\.com)\/(\w{32})/,
      '$1/avatar/$2?s=50&d=mm'
    )
  }

  var config = {
    apiKey: 'AIzaSyCL7buZsLVXXQ3Wp7buGEUdlU2qhAPpVwY',
    authDomain: 'beer-js.firebaseio.com',
    databaseURL: 'https://beer-js.firebaseio.com/'
  }
  firebase.initializeApp(config)
  firebase.auth().signInAnonymously().catch(function (error) {
    console.log(error.message) // eslint-disable-line
  })
  var database = firebase.database()

  function notifyMe (title, body) {
    var notification // eslint-disable-line
    if (!('Notification' in window)) {
      alert(body)
    } else if (Notification.permission === 'granted') {
      notification = new Notification(title, {
        body: body,
        icon: 'http://www.beerjs.cl/assets/images/sticker-beerjs-vaso.png'
      })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        notification = new Notification(title, {
          body: body,
          icon: 'http://www.beerjs.cl/assets/images/sticker-beerjs-vaso.png'
        })
      })
    }
  }

  function insertData (data) {
    var message = data.val()
    var html = message.markdown || '<span>' + message.text + '</span>'
    output.innerHTML =
      '<p data-id="' +
      message.timestamp +
      '"><img class="avatar" title="' +
      message.author.name +
      ' (' +
      new Date(parseInt(message.timestamp, 10)) +
      ')" src="' +
      message.author.user_image_url +
      '">' +
      html +
      '</p>' +
      output.innerHTML
    var now = new Date()
    now.setSeconds(now.getSeconds() - 5)
    if (
      lastMessage !== message.timestamp &&
      now.getTime() < parseInt(message.timestamp, 10)
    ) {
      notifyMe(
        'Beerjs',
        'Autor: ' + message.author.name + '\nMensaje: ' + message.text
      )
    }
  }

  // Obtiene los mensajes previos
  database.ref('rooms/beer-js/messages').once('value').then(function (messages) {
    console.log('Load all messages') // eslint-disable-line
  })

  // Escucha nuevos mensajes
  database.ref('rooms/beer-js/messages').on('child_added', insertData)

  inputMessage.addEventListener(
    'keyup',
    function (e) {
      ;(e.keyCode || e.charCode) === 13 && sendMessage()
    },
    false
  )
  btnSend.addEventListener('click', sendMessage, false)

  inputEmail.addEventListener(
    'keyup',
    function (e) {
      ;(e.keyCode || e.charCode) === 13 && loadAvatar()
    },
    false
  )
  inputUsername.addEventListener(
    'keyup',
    function (e) {
      ;(e.keyCode || e.charCode) === 13 && loadAvatar()
    },
    false
  )
  btnLogin.addEventListener('click', loadAvatar, false)

  btnLogout.addEventListener('click', logout, false)

  // Envia nuevos mensajes
  function sendMessage () {
    if (inputMessage.value !== '') {
      lastMessage = Date.now().toString()
      var html = md.render(inputMessage.value)
      html = html.replace(/<p>/g, '<span>')
      html = html.replace(/<\/p>/g, '</span>')
      html = html.replace(/\n/g, '')
      var div = document.createElement('div')
      div.innerHTML = html
      var text = div.textContent || div.innerText || ''
      var message = {
        author: {
          name: author.name,
          user_image_url: author.avatar
        },
        text: text,
        markdown: html,
        timestamp: lastMessage
      }
      inputMessage.value = ''
      database.ref('rooms/beer-js/messages').push(message)
    }
  }

  // Envia nuevos mensajes
  function loadAvatar () {
    if (inputEmail.value !== '' && inputUsername.value !== '') {
      var img = getAvatar(inputEmail.value)
      author.name = inputUsername.value
      author.avatar = img
      imgAvatar.src = img
      inputEmail.value = ''
      inputUsername.value = ''
      divLogin.style.display = 'none'
      divLogout.style.display = 'block'
      localStorage.setItem('username', author.name)
      localStorage.setItem('avatar', author.avatar)
    }
  }

  function logout () {
    author.name = 'anonymous'
    author.avatar = defaultAvatar
    imgAvatar.src = defaultAvatar
    divLogin.style.display = 'block'
    divLogout.style.display = 'none'
    localStorage.removeItem('username')
    localStorage.removeItem('avatar')
  }
})()
