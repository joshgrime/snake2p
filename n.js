const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const jsonfile = require('jsonfile')

server.listen(3000);

app.use(express.static('public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

var leaderBoard = [];

jsonfile.readFile('leaderboard.json', function(err, obj) {
for (i=1;i<11;i++) {
 leaderBoard.push(obj[i].score);
}
});


var allClients = [];

io.on('connection', function (socket) {
  jsonfile.readFile('leaderboard.json', function(err, obj) {
  socket.emit('leaderboard', obj);
  for (i=1;i<11;i++) {
   leaderBoard.push(obj[i].score);
  }
});

allClients.push({'id':socket.id, 'room':''});

socket.on('disconnect', function() {
var room;
function step1(callback) {
  for (i=0;i<allClients.length;i++) {
      if (allClients[i].id == socket.id) {
        room = allClients[i].room;
        io.to(room).emit('playerLeftRoom');
        callback();
        break;
      }
    }
}
function step2() {
  var i = allClients.indexOf(socket.id);
  allClients.splice(i, 1);
}
step1(step2);
});

socket.on('queueEnter', function (data) {
console.log('New player: '+JSON.stringify(data));
var gameName;
var roomx = data.playerName.toLowerCase();
var clientsx = io.sockets.adapter.rooms[roomx];
  if (data.gameRoom == 'host' && clientsx == undefined) { //host a game
    gameName = roomx;
    socket.join(gameName);
    socket.emit('hoster', gameName);
    console.log('Created a room called '+data.playerName);
    hotelManager('push', socket.id, gameName);
  }
  else if (data.gameRoom !== 'host') { //join a game
    var room = data.gameRoom.toLowerCase();
    var clients = io.sockets.adapter.rooms[room];
    if (clients == undefined) {
    socket.emit('noRoom', data.gameRoom);
    console.log(data.playerName +' could not find room called ' + data.gameRoom);
    }
    else if (clients.length == 1) { //join successful
      gameName = data.gameRoom.toLowerCase();
      socket.join(gameName);
      hotelManager('push', socket.id, gameName);
      console.log(data.playerName+' joined a room called '+data.gameRoom);
      io.to(gameName).emit('gameStart', {'gn':gameName, 'pn':data.playerName});
      console.log(clients.sockets);
    }
    else if (clients.length > 1) { // tried to join but game is full
    socket.emit('roomFull', data.gameRoom)
    }
  }
  else if (data.gameRoom == 'host') { //host a game but game already exists
    console.log(data.playerName +' tried to create room called ' + data.playerName + ', but room already exists.');
    socket.emit('hostExists', data.playerName);
  }

});

socket.on('cancel', function (data) {
  socket.leave(data);
  hotelManager(null, socket.id, data);
  io.to(data).emit('playerLeftRoom');
});

socket.on('gogogo', function (data) {
  var clients = io.sockets.adapter.rooms[data.gameName];
  if (clients.length !== undefined){
  if (clients.length == 2) {
  console.log('Loading up a game! in 3 seconds! >> '+ data.gameName);
  io.to(data.gameName).emit('countdown');
  setTimeout(function() {
  io.to(data.gameName).emit('startGame', data.gameName);
  game(data);
  }, 3000);
}
else {
  console.log('Not enough players! Closing.');
  socket.emit('lowPlayers');
}}
else {
  console.log('Not enough players! Closing.');
  socket.emit('lowPlayers');
}
});

function game(data) {
var clients = io.sockets.adapter.rooms[data.gameName].sockets;
var pids = Object.keys(clients);
var gameName = data.gameName;
var player1Name = data.player1Name;
var player2Name = data.player2Name;
var player1id = pids[0];
var player2id = pids[1];
var player1score = 0;
var player2score = 0;
var gamelive = true;

    class Snake {
      constructor(player) {
        this.player = player;
        this.steveIrwin = [];
        this.start = function () {
                  if (this.player == 'player1'){
                  this.steveIrwin = [{'i':300,'j':320}];
                  }
                  else {
                  this.steveIrwin = [{'i':300,'j':630}];
                  }
                  }
        this.otherPlayer = function () {
        if (this.player == 'player1') {return player2.steveIrwin;} else {return player1.steveIrwin;}}
        this.guard = false;
        this.direction = 'down';
        this.ms = 38;
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
              return;
            }

          }
          this.steveIrwin.unshift({'i':i,'j':j});
          if (i == frui && j == fruj) {
            this.eat();
          }
          else {
            var y = this.steveIrwin.length - 1;
            this.steveIrwin.length = this.size;
            for (let u=0;u<otherplayer.length;u++){
            if (this.steveIrwin[0].i == otherplayer[u].i && this.steveIrwin[0].j == otherplayer[u].j) {
              this.die();
              return;
            }
          }
          }
          var op = jim;
          pushToClient(op);
          if (op == 1) {
          setTimeout(function(){if (gamelive) {player1.move(1);}}, this.ms);
          }
          else if (op == 2) {
          setTimeout(function(){if (gamelive) {player2.move(2);}}, this.ms);
        }
}
        this.eat = function () {
          io.in(gameName).emit('fruitDel');
          this.size++;
          fruitPicker(player1.steveIrwin,player2.steveIrwin,gameName);
          if (this.ms > 30){
          this.ms -= 1;}
          if (this.player == 'player1') {player1score += 10;} else {player2score += 10;}
          io.in(gameName).emit('score', {'p1s':player1score,'p2s':player2score});
          }

        this.die = function () {
          gamelive = false;
          var player = this.player;
          io.in(gameName).emit('snakeDed', player);
          io.local.emit('gameReport', {'player1':player1Name, 'player2':player2Name, 'winner': player});
          if (player == 'player1') {
            referee(player2score, player2Name);
          }
          else {
            referee(player1score, player1Name);
          }
          }
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
  io.in(gameName).emit('snakeMove', data);
  p1 = false;
  p2 = false;
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

socket.on('disconnect', function() {
player1.die();
});
socket.on('otherPlayerDC', function() {
  player2.die();
});

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

function referee (score, name) {
  console.log(name +' scored '+score);
  var result = true;
  var index;
  for (let i=0; i < 10; i++) {
      if (leaderBoard[i] < score) {
          result = false;
          index = i + 1;
          break;
      }
  }
  if (!result) {
    jsonfile.readFile('leaderboard.json', function(err, obj) {
      newhiScore(obj, index, score, name);
    });
  }
  else {
    result = true;
    console.log('not a new hi score');
  }
}


function newhiScore(obj, index, score, name) {
  for (let i=10;i>index;i--) {
    obj[i].score = obj[i-1].score;
    obj[i].name = obj[i-1].name;
  }
  obj[index].score = score;
  obj[index].name = name;

  jsonfile.writeFile('leaderboard.json', obj, function (err) {
    console.log(err);
});

  for (i=1;i<11;i++) {
   leaderBoard.push(obj[i].score);
  }

  io.local.emit('leaderboard', obj);
  io.local.emit('newHiScore', {'name':name, 'score':score, 'rank':index});

}

function hotelManager (type, pid, room) {
  for (i=0;i<allClients.length;i++) {
    if (allClients[i].id == pid) {
      if (type == 'push') {allClients[i].room = room;}
      else {allClients[i].room = '';}
      break;
    }
  }
}
