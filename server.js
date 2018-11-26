var app = require('express')();
var http = require('http').Server(app);
var logger = require('./lib/winstonlogger');
var io = require('socket.io')(http);
var schedule = require('node-schedule');


var serverProto = {

    server: function server() {}

}

function serverCreate(options) {
    

    var obj=Object.assign(Object.create(serverProto), options);
    
    obj.server=function(){
        that=this;

        app.get('/', function (req, res) {
            res.send('<h1>Genesys Release notes webscrapper service</h1>');
        });

        app.get('/status', function (req, res) {
            
            res.writeHead(200, { "Content-Type": "text/html" });
            
            res.write('<h1>Genesys Release notes webscrapper service</h1>');
            res.write('<p>'+((!that.job.scrapper)?"Scrapper has never been started, check /nextrun for time of next execution":that.job.scrapper.report())+'</h1>');
            
            res.end();
            //res.send('<p>'+this.job.scheduledJob.nextInvocation().toString()+'</p>');
        });

        app.get('/nextrun', function (req, res) {
            
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write('<h1>Genesys Release notes webscrapper service</h1>');
            res.write('<h3>Next service execution</h3>');
            res.write('<p>'+that.job.scheduledJob.nextInvocation().toString()+'</p>');
            res.end();
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
    return obj;
}

module.exports = serverCreate;