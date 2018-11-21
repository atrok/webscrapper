var app = require('express')();
var http = require('http').Server(app);
var logger = require('./lib/winstonlogger');
var io = require('socket.io')(http);
var schedule = require('node-schedule');

var server= function(){
app.get('/', function (req, res) {
    res.send('<h1>Genesys Release notes webscrapper service</h1>');
});

http.listen(3000, function () {
    logger.info('listening on *:3000');
});

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });

    socket.on('start job', function (msg) {
        io.emit('chat message', msg);
    });

    socket.on('stop job', function (msg) {
        io.emit('chat message', msg);
    });

    socket.on('job status', function (msg) {
        io.emit('chat message', msg);
    });
});
}

module.exports=server;