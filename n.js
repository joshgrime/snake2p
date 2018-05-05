const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3000);

app.use(express.static('public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function (socket) {
  console.log('got a connect');

socket.on('queueEnter', function (data) {
console.log(data);
var gameName;
  if (data.gameRoom == 'host') { //host a game
    socket.join(data.playerName);
    console.log('created a room called '+data.playerName);
    gameName = data.playerName;
    socket.emit('hoster');
  }
  else { //join a game
    console.log('joined a room called '+data.gameRoom);
    var clients = io.sockets.adapter.rooms[data.gameRoom];
    gameName = data.gameRoom;
    if (clients.length == 1) {
      socket.join(gameName);
      io.to(gameName).emit('gameStart', {'gn':gameName, 'pn':data.playerName});
      console.log(clients.sockets);
    }
    else if (clients.length > 1) {

    }
  }

});

socket.on('gogogo', function (data) {
  console.log('loading up a game');
  io.to(data).emit('startGame', data);
game(data);
});

function game(gameName) {
var clients = io.sockets.adapter.rooms[gameName].sockets;
var pids = Object.keys(clients);
console.log(pids);
var gameName = gameName;
var player1id = pids[0];
var player2id = pids[1];

    class Snake {
      constructor(player) {
        this.player = player;
        this.steveIrwin = [];
        this.start = function () {
                  if (this.player == 'player1'){
                  this.steveIrwin = [{'i':300,'j':320}];
                  console.log('Player 1 created. Steve Irwin is:');
                  console.log(this.steveIrwin);
                  }
                  else {
                  this.steveIrwin = [{'i':300,'j':630}];
                  console.log('Player 2 created. Steve Irwin is:');
                  console.log(this.steveIrwin);
                  }
                  }
        this.otherPlayer = function () {
          if (this.player == 'player1') {return player2.steveIrwin;} else {return player1.steveIrwin;}}
        this.guard = false;
        this.direction = 'down';
        this.ms = 50;
        this.size = 1;

        this.position = function () {
          var i = this.steveIrwin[0].i;
          var j = this.steveIrwin[0].j;
          return {'i':i,'j':j};
        }

        this.nextBox = function () {
          var pos = this.position();
          var dir = this.direction;
          var i = pos.i;
          var j = pos.j;
          if (dir == 'left') {j -= 10;}
          else if (dir == 'right') {j += 10;}
          else if (dir == 'up') {i -= 10;}
          else if (dir == 'down') {i += 10;}
          return {'i':i,'j':j};
        }

        this.move = function (jim) {
          var newPos = this.nextBox();
          var i = newPos.i;
          var j = newPos.j;
          var frui = fruitLoc.i;
          var fruj = fruitLoc.j;

          if (i < 50) {i = 640};
          if (i > 640) {i = 50};
          if (j < 60) {j = 900};
          if (j > 900) {j = 60};

          var otherplayer = this.otherPlayer();
          for (let z=0;z<this.steveIrwin.length;z++) {
            if (this.steveIrwin[z].i == i && this.steveIrwin[z].j == j) {
              this.die();
              console.log('player '+this.player+ 'died');
              return;
            }
            for (let u=0;u<otherplayer.length;u++){

            if (this.steveIrwin[0].i == otherplayer[u].i && this.steveIrwin[0].j == otherplayer[u].j) {
              this.die();
              console.log('player '+this.player+ 'died');
              return;
            }
          }

          }
          this.steveIrwin.unshift({'i':i,'j':j});
          if (i == frui && j == fruj) {
            this.eat();
          }
          else {
            var y = this.steveIrwin.length - 1;
            this.steveIrwin.length = this.size;
          }
          var op = jim;
          pushToClient(op);
          if (op == 1) {
          setTimeout(function(){player1.move(1);}, this.ms);
          }
          else if (op == 2) {
          setTimeout(function(){player2.move(2);}, this.ms);
        }
}
        this.eat = function () {
          io.in(gameName).emit('fruitDel');
          this.size++;
          fruitPicker(player1.steveIrwin,player2.steveIrwin,gameName);
          if (this.ms > 10){
          this.ms -= 4;}
          }

        this.die = function () {
          return;
          }

          //setTimeout(function(){$('#buttonhold').append('<button id="play" style="opacity: 0;" onclick="snake()">Play</button>');
          //$("#play").animate({
            //  opacity: 1
          //  }, 800 );
      //  }, 2000);
       }
      }

var p1 = false;
var p2 = false;
function pushToClient(player) {
if (player == 1) {
  p1 = true;
}
else {
  p2 = true;
}

if (p1 == true && p2 == true) {
  var data = {'p1': player1.steveIrwin, 'p2': player2.steveIrwin};
  //console.log('Snakeies: '+JSON.stringify(data, null, 1));
  //console.log('Sending snakes to: ' +gameName);
  io.in(gameName).emit('snakeMove', data);
  p1 = false;
  p2 = false;

  //console.log('moved '+p1+p2);
}
}

var fruitLoc;
function fruitPicker(steveIrwin, davidAttenborough) {
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  var i = getRandomInt(0, 60);
  var j = getRandomInt(0, 85);
  i *= 10;
  j *= 10;

  if (i <= 50 || i > 640 || j <= 60 || j >= 900) {
    fruitPicker(steveIrwin, davidAttenborough);
    return;
  }

  for (let z=0;z<steveIrwin.length;z++) {
    if (steveIrwin[z].i == i && steveIrwin[z].j == j) {
      fruitPicker(steveIrwin, davidAttenborough);
      return;
    }
}
for (let y=0;y<davidAttenborough.length;y++) {
if (davidAttenborough[y].i == i && davidAttenborough[y].j == j) {
  fruitPicker(steveIrwin, davidAttenborough);
  return;
}
}
var colors = ['#F52078', '#a5cdf8', '#e8e87c'];
var color = colors[Math.floor(Math.random() * colors.length)];
var obj = {'i':i,'j':j,'color':color};
console.log('Sending bananas to '+gameName+': '+obj);
io.in(gameName).emit('fruit', obj);
fruitLoc = obj;

}
    fruitPicker([{'i':300,'j':320}], [{'i':300,'j':630}]);
    var player1 = new Snake('player1');
    var player2 = new Snake('player2');
    player1.start();
    player2.start();
    player1.move(1);
    player2.move(2);



  socket.on('left', function (data) {
      if (data == true) {
        if (player1.direction == 'right') {return;}
        else {
        player1.direction = 'left';
      }
      }
      else {
        if (player2.direction == 'right') {return;}
        else{
        player2.direction = 'left';
      }
      }
  });
  socket.on('right', function (data) {
    if (data == true) {
      if (player1.direction == 'left') {return;}
      else {
      player1.direction = 'right';
    }
    }
    else {
      if (player2.direction == 'left') {return;}
      else {
      player2.direction = 'right';
    }
    }
  });
  socket.on('up', function (data) {
    if (data == true) {
      if (player1.direction == 'down') {return;}
      else {
      player1.direction = 'up';
    }
    }
    else {
      if (player2.direction == 'down') {return;}
      else {
      player2.direction = 'up';
    }
    }
  });
  socket.on('down', function (data) {
    if (data == true) {
      if (player1.direction == 'up') {return;}
      else {
      player1.direction = 'down';
    }
    }
    else {
      if (player2.direction == 'up') {return;}
      else {
      player2.direction = 'down';
    }
    }
  });
}

socket.on('move', function (data) {
  var gameName = data.gr;
  io.to(gameName).emit('moveSync', data);
});

});
