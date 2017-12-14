var socket = io.connect('/');


socket.on('players', function (data) {
  $("#numPlayers").text(data.number);
  $("#welcome").text(data.message);
    });

socket.on('msg', function (data) {
     Materialize.toast(data.isBest, 4000) 
  $("#best").append(data.isBest + " ");
    });

function broadcast(name){
    var results = document.getElementById("name").innerHTML.toString() + " said " + document.getElementById("msg").value
    socket.emit('test', { isBest : results });
}
