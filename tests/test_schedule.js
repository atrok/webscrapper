var schedule = require('node-schedule');
var scrapperfabric=require('../scrapper');
var logger=require('../lib/winstonlogger');
var server=require('../server');


var j = schedule.scheduleJob('5 * * * *', function(){
    console.log('Scheduled job is starting');

    var scrapper=scrapperfabric.scrapperCreate({logger: logger});

    scrapper.start();
  });

server();
console.log(j.nextInvocation())