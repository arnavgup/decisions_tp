exports.init = function(io) {
    var currentPlayers = 0; 

    io.sockets.on('connection', function (socket) {
        ++currentPlayers;

        socket.emit('players', { number: currentPlayers});

        socket.broadcast.emit('players', { number: currentPlayers});

         socket.on('test', function (data) {
            to_send = data.isBest
            socket.emit('msg', { isBest: to_send});
            socket.broadcast.emit('msg', { isBest: to_send});
          });

        socket.on('disconnect', function () {
            --currentPlayers;
            socket.broadcast.emit('players', { number: currentPlayers});
        });
    });
}
