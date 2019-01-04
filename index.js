var logger = require('./lib/winstonlogger');


var serverCreate = require('./server');

var server = serverCreate();
server.start();

//console.log(j.nextInvocation())