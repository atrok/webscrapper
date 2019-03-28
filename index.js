var logger = require('./lib/winstonlogger');
var configuration=require('./configuration');


var serverCreate = require('./server');

var server = serverCreate(configuration);
server.start();

//console.log(j.nextInvocation())