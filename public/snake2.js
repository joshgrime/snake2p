var soundstate = true;
var socket = io.connect('http://localhost:3000');
var hoster = false;
var gameName = '';
var playerName = '';
var player2Name = '';
var gamelive = false;

var startSound = new Howl({
  src: ['start.mp3', 'start.wav']
});

var gameOverSound = new Howl({
  src: ['gameover.mp3', 'gameover.wav']
});

var eatSound = new Howl({
  src: ['eat.mp3', 'eat.wav']
});

var winSound = new Howl({
  src: ['win.mp3', 'win.wav']
});

socket.on('hoster', function(data) {
  hoster = true;
  playerName = data;
  gameName = data;
  $('#play').css('display', 'none');
  $('#enterWindow').empty().append('<span id="name" style="color:#a3ffbd; font-size: 70px;">'+playerName+'</span>');
  $('#enterWindow').append('<p /><span style="font-size: 30px;">Waiting for someone to join...');
  $('#enterWindow').append('<p /><button id="restartBtn" class="smallBtn" onclick="restart()">Back</button>');
});

socket.on('lowPlayers', function () {
  $('#canvas').prepend('<span id="dc" class="cdw">Opponent disconnected. Returning to main menu.</span>');
  setTimeout(function() {
    $('#gameStartButton').css('display', 'none');
    restart();
  }, 3000);
});

socket.on('gameStart', function(data) {
  var name = $('#name');
  if (hoster == true) {
  player2Name = data.pn;
  $('#gameStartButton').css('display', 'block').css('text-align', 'center');
  $('#enterWindow').empty().append(name).append('<p /><span style="font-size: 30px;"><span style="color:#e25865;">'+data.pn+'</span> has joined!').append('<p /><button id="restartBtn" class="smallBtn" onclick="restart()">Back</button>');
  }
  else {
    $('#enterWindow').empty().append('<p /><span style="font-size: 30px;">You have joined <span style="color:#e25865;">'+data.gn+'</span><p />Waiting for game to start.').append('<p /><button id="restartBtn" class="smallBtn" onclick="restart()">Back</button>');
  }
  gameName = data.gn;
});

socket.on('playerLeftRoom', function() {
  console.log('player left and '+gamelive);
  if (gamelive) {
  $('#canvas').prepend('<span id="dc" class="cdw">Other player has left the game!</span>');
  socket.emit('otherPlayerDC');
  postGameAfterDC();
  }
  else {
  $('#enterWindow').empty().append('<p /><span style="font-size: 30px;">Other player has left!');
  if (hoster) {$('#gameStartButton').css('display', 'none'); setTimeout(function () { $('#enterWindow').empty().append('<span id="name" style="color:#a3ffbd; font-size: 70px;">'+playerName+'</span><p /><span style="font-size: 30px;">Waiting for someone to join...</span><p /><button id="restartBtn" class="smallBtn" onclick="restart()">Back</button>'); }, 3000);}
  else {setTimeout(function() { restart(); }, 3000);}
}
});

socket.on('noRoom', function(data) {
  console.log('no room');
  $('#enterWindow').append('<p /><p /><span id="err" style="opacity: 0; color: #e25865; font-size: 40px; position: absolute; top: 100px; left: 130px; width: 700px;">Host '+data+' was not found, please try again.');
  $('#err').animate({opacity: '1'}, 200 );
  setTimeout(function(){$('#err').animate({opacity: '0'}, 200 );}, 3000);
  setTimeout(function(){$('#err').remove();}, 3500);
});

socket.on('roomFull', function (data) {
  console.log('room full');
  $('#enterWindow').append('<p /><p /><span id="err" style="opacity: 0; color: #e25865; font-size: 40px; position: absolute; top: 100px; left: 130px; width: 700px;">'+data+' is already in a game.');
  $('#err').animate({opacity: '1'}, 200 );
  setTimeout(function(){$('#err').animate({opacity: '0'}, 200 );}, 3000);
  setTimeout(function(){$('#err').remove();}, 3500);
});

socket.on('hostExists', function (data) {
  console.log('host exists');
  $('#enterWindow').append('<p /><p /><span id="err" style="opacity: 0; color: #e25865; font-size: 40px; position: absolute; top: 100px; left: 130px; width: 700px;">Someone called '+data+' is already playing!');
  $('#err').animate({opacity: '1'}, 200 );
  setTimeout(function(){$('#err').animate({opacity: '0'}, 200 );}, 3000);
  setTimeout(function(){$('#err').remove();}, 3500);
});

socket.on('gameReport', function (data) {
  if (data.winner = 'player2') {
    winner = data.player1;
    loser = data.player2;
  }
  else {
    winner = data.player2;
    loser = data.player1;
  }

  $('#feed').append('<p /><span>'+winner+' has beaten '+loser+'!');

});

socket.on('leaderboard', function(data) {

  for (i=1;i<11;i++) {
    $('#t-'+i+'name').empty();
    $('#t-'+i+'score').empty();
  }

  for (i=1;i<11;i++) {
    $('#t-'+i+'name').append(data[i].name);
    $('#t-'+i+'score').append(data[i].score);
  }
});

socket.on('newHiScore', function(data) {
  if (data.rank == 1) {
    $('#feed').append('<p /><span style="color: #a7f8a5; font-size:40px">'+data.name+' has scored the top score with <span style="color: #e25865">'+data.score+'</span> points!</span>');
  }
  else if (data.rank == 2) {
    $('#feed').append('<p /><span style="color: #a7f8a5;">'+data.name+'</span> scored the '+data.rank+'nd highest score with <span style="color: #a7f8a5">'+data.score+'</span> points!');
  }
  else if (data.rank == 3) {
    $('#feed').append('<p /><span style="color: #a7f8a5;">'+data.name+'</span> scored the '+data.rank+'rd highest score with <span style="color: #a7f8a5">'+data.score+'</span> points!');
  }
  else {
  $('#feed').append('<p /><span style="color: #a7f8a5;">'+data.name+'</span> scored the '+data.rank+'th highest score with <span style="color: #a7f8a5">'+data.score+'</span> points!');
}
});

socket.on('startGame', function(data) {
  $('.cdw').remove();
  snake(socket);
});

socket.on('score', function(data) {
var p = 'e';
var e = 'p';
console.log(data.p1s);
console.log(data.p2s);
  if (hoster) {p = 'p'; e = 'e';}
$('#'+p+'score').html(data.p1s);
$('#'+e+'score').html(data.p2s);
});

function soundcontrol() {
  var state = $('#sound').css('background-image');
  state = state.substr(state.length - 13);
  if (state.startsWith('soundon')) {
    state = 'on';
  }

  if (state == 'on') {
    $('#sound').css("background-image", "url(soundoff.png)");
    soundstate = false;
  }
  else {
    $('#sound').css("background-image", "url(soundon.png)");
    soundstate = true;

  }

}

socket.on('snakeDed', function(data){

  if (data == 'player1' && hoster == true) {
    loseGame();
  }
  else if (data == 'player2' && hoster == false) {
    loseGame();
  }
  else {
    winGame();
  }
  gamelive = false;
  postGame();
});

socket.on('fruitDel', function(){
  $('.fruit').remove();
});

socket.on('fruit', function(data){
  if(soundstate) {eatSound.play();}
  $('#canvas').append('<div class="fruit" style="background-color: '+data.color+'; height: 10px; width: 10px; border: 1px black solid; position: absolute; top: '+data.i+'px; left: '+data.j+'px;"></div>');
});

socket.on('moveSync', function (data) {
  var dir = data.dir;
  socket.emit(dir, data.host);
});

socket.on('countdown', function () {
  $('.cdw').remove();
  $('#quitBtn').remove();
  $('#enter').css('display', 'none');
  $('#game').css('display', 'block');
  $('#canvas').append('<span class="cdw">Game starting in....</span><span class="cdw" id="countdown">3</span>');
    setTimeout(function() { $('#countdown').html('2');
        setTimeout(function() { $('#countdown').html('1');
      }, 1000);
    }, 1000);
});

socket.on('snakeMove', function (data) {

  var p1 = data.p1;
  var p2 = data.p2;

  $('.snake').remove();
  $('.esnake').remove();

  if (hoster == true) {
    for (let m of p1) {
      blacker(m);
    }
    for (let n of p2) {
      eblacker(n);
    }
  }

  else {
    for (let m of p1) {
      eblacker(m);
    }
    for (let n of p2) {
      blacker(n);
    }
  }

});

function snake (socket) {
//sounds
gamelive = true;


  if(soundstate) {startSound.play();}

$('.esnake').remove();
$('.psnake').remove();
$('.fruit').remove();

$('#enter').css('display', 'none');
$('#game').css('display', 'block');

$('#pscore').html('0');
$('#escore').html('0');

scorergb(1, 'p');
setTimeout(function(){scorergb(4, 'e');}, 1000);

}

function startg() {
  $('#gameStartButton').css('display', 'none');
  $('#newGameBtn').remove();
  $('.esnake').remove();
  $('.psnake').remove();
  socket.emit('gogogo', {'gameName':gameName, 'player1Name': playerName, 'player2Name': player2Name});
}

function blacker (square) {
  var i = square.i;
  var j = square.j;
  var id = square.id;
  $('#canvas').append('<div class="snake" style="background-color: #a7f8a5; height: 10px; width: 10px; border: 1px black solid; position: absolute; top: '+i+'px; left: '+j+'px;"></div>');
}

function eblacker (square) {
  var i = square.i;
  var j = square.j;
  var id = square.id;
  $('#canvas').append('<div class="esnake" style="background-color: #f4424e; height: 10px; width: 10px; border: 1px black solid; position: absolute; top: '+i+'px; left: '+j+'px;"></div>');
}



function scorergb(type, p) {
if (type == 1) {
  var next = 2;
  $("#"+p+"score").animate({
  		color: '#F52078;'
  	}, 1500 );

}

else if (type == 2) {
  var next = 3;
  $("#"+p+"score").animate({
  		color: '#7db9e8'
  	}, 1500 );
}

else if (type == 3) {
  var next = 4;
  $("#"+p+"score").animate({
  		color: '#4F3DCE'
  	}, 1500 );
}
else if (type == 4) {
  var next = 5;
  $("#"+p+"score").animate({
  		color: '#7db9e8'
  	}, 1500 );
}
else if (type == 5) {
  var next = 1;
  $("#"+p+"score").animate({
  		color: '#fff'
  	}, 750 );
    $("#"+p+"score").animate({
    		color: '#a7f8a5'
    	}, 750 );
}
setTimeout(function(){scorergb(next, p);}, 1000);

}



$(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
        socket.emit('move', {'dir':'left','gr':gameName, 'host':hoster});
        break;

        case 38: // up
        socket.emit('move', {'dir':'up','gr':gameName, 'host':hoster});
        break;

        case 39: // right
        socket.emit('move', {'dir':'right','gr':gameName, 'host':hoster});
        break;

        case 40: // down
        socket.emit('move', {'dir':'down','gr':gameName, 'host':hoster});
        break;

        default: return;
    }
    e.preventDefault();
});

function restart() {
$('.cdw').remove();
$('.esnake').remove();
$('.psnake').remove();
$('#enter').css('display', 'block');
$('#game').css('display', 'none');
$('#quitBtn').remove();
if (hoster == true) {var data = playerName;} else {var data = gameName;}
socket.emit('cancel', data);
$('#gameStartButton').css('display', 'none');
var html = 'What is your name, Snake?<p /><input id="namePut" class="textinput" type="text"></input><p /><form id="serverPick"><input type="radio" id="server-1" name="server-sel" value="host" onclick="hideBox()" style="display:none;" checked><label class="s-pick" for="server-1" onclick="hideBox()">Host</label><input type="radio" id="server-2" name="server-sel" value="join" onclick="showBox()" style="display:none;"><label class="s-pick" for="server-2" onclick="showBox()">Join</label></form><p /><input type="text" id="server-3" class="textinput" style="display:none;"></input><p /><div id="buttonhold"><button id="play" class="smallBtn" onclick="joinQ()">Play</button></div>';
$('#enterWindow').empty().append(html);
hoster = false;
gameName = '';
playerName = '';
player2Name = '';
}

function joinQ() {
  var name = $('#namePut').val();
  var nome = name.toLowerCase();
  if (name == '' || nome == 'host') {console.log('no entry'); return}
  var serverPick = $('input[name=server-sel]:checked', '#serverPick').val();
  var gameRoom = 'host';
  if (serverPick == 'join') {
    gameRoom = $('#server-3').val();
    gameRoom = gameRoom.toLowerCase();
    if (gameRoom == '') {return;}
  }
  var data = {'playerName': name, 'gameRoom': gameRoom};
  socket.emit('queueEnter', data);
}

function loseGame() {
  if(soundstate) {gameOverSound.play();}
  $('.psnake').css('background-color: black;');
  $('#canvas').prepend('<span class="cdw" id="lint">YOU LOSE</span>');
}

function winGame() {
  if(soundstate) {winSound.play();}
  $('.esnake').css('background-color: black;');
  $('#canvas').prepend('<span class="cdw" id="wint">YOU WIN</span>');
}

function postGame() {
if(hoster){$('#canvas').append('<button id="newGameBtn" class="smallBtn" onclick="startg()">Play again</button>');}
$('#canvas').append('<button id="quitBtn" class="smallBtn" onclick="restart()">Quit</button>');
}

function postGameAfterDC() {
$('#canvas').append('<button id="quitBtn" class="smallBtn" onclick="restart()">Quit</button>');
}
