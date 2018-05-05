var soundstate = true;
var socket = io.connect('http://localhost:3000');
var hoster = false;
var gameName = '';

socket.on('hoster', function(data) {
  hoster = true;
});

socket.on('gameStart', function(data) {
  console.log('start the game yo!');
  var name = $('#name');
  if (hoster == true) {
  $('#gameStartButton').css('display', 'block').css('text-align', 'center');
  $('#enterWindow').empty().append(name).append('<p /><span style="font-size: 30px;"><span style="color:#e25865;">'+data.pn+'</span> has joined!');
  }
  else {
  $('#enterWindow').append('<p /><span style="font-size: 30px;">You have joined <span style="color:#e25865;">'+data.gn+'</span><p />Waiting for game to start.');
  }
  gameName = data.gn;
});

socket.on('startGame', function(data) {
  snake(socket);
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

socket.on('fruitDel', function(){
  $('.fruit').remove();
});

socket.on('fruit', function(data){
  score();
  $('#canvas').append('<div class="fruit" style="background-color: '+data.color+'; height: 10px; width: 10px; border: 1px black solid; position: absolute; top: '+data.i+'px; left: '+data.j+'px;"></div>');
});

socket.on('moveSync', function (data) {
  var dir = data.dir;
  socket.emit(dir, data.host);
});

socket.on('snakeMove', function (data) {

  console.log('Snakes moved');

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

  var startSound = new Howl({
    src: ['start.mp3', 'start.wav']
  });

  var eatSound = new Howl({
    src: ['eat.mp3', 'eat.wav']
  });

  var gameOverSound = new Howl({
    src: ['gameover.mp3', 'gameover.wav']
  });

  if(soundstate) {startSound.play();}

$('#play').css('display', 'none');
$('.snake').remove();
$('.fruit').remove();

$('#enter').css('display', 'none');
$('#game').css('display', 'block');

}

function startg() {
  socket.emit('gogogo', gameName);
  $('#gameStartButton').remove();
}

function blacker (square) {
  var i = square.i;
  var j = square.j;
  var id = square.id;
  $('#canvas').append('<div id="'+id+'" class="snake" style="background-color: #a7f8a5; height: 10px; width: 10px; border: 1px black solid; position: absolute; top: '+i+'px; left: '+j+'px;"></div>');
}

function eblacker (square) {
  var i = square.i;
  var j = square.j;
  var id = square.id;
  $('#canvas').append('<div id="'+id+'" class="esnake" style="background-color: #f4424e; height: 10px; width: 10px; border: 1px black solid; position: absolute; top: '+i+'px; left: '+j+'px;"></div>');
}

$('#pscore').html('0');
$('#escore').html('0');


function score () {
  var score;
  score = $('#pscore').html();
  if (score == '0') {score = 0;}
  else { score = parseInt(score);}
  score ++;
  $('#score').empty();
  $('#score').append(score);
}

scorergb(1, 'p');
setTimeout(function(){scorergb(4, 'e');}, 1000);

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




function joinQ() {
  var name = $('#namePut').val();
  if (name == '') {console.log('no entry'); return}
  var serverPick = $('input[name=server-sel]:checked', '#serverPick').val();
  var gameRoom = 'host';
  if (serverPick == 'join') {
    gameRoom = $('#server-3').val();
    if (gameRoom == '') {console.log('no entry'); return}
  }
  var data = {'playerName': name, 'gameRoom': gameRoom};
  socket.emit('queueEnter', data);

  $('#enterWindow').empty().append('<span id="name" style="color:#a3ffbd; font-size: 70px;">'+name+'</span>');

  if (serverPick == 'host') {
    $('#play').css('display', 'none');
    $('#enterWindow').append('<p /><span style="font-size: 30px;">Waiting for someone to join...');
  }

}
