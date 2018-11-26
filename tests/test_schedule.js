var schedule = require('node-schedule');
var logger=require('../lib/winstonlogger');
var scrapper=require('../scrapper').scrapperCreate({logger: logger});

var serverCreate=require('../server');


var job={
  scheduledJob:null,
  scrapper:scrapper,
  report:{invocations:0}
}
 job.scheduledJob = schedule.scheduleJob('* * */1 * *', function(){
    logger.info('Scheduled job is starting');
    job.report.invocations++;

    job.scrapper.start();
  });

var server=serverCreate({job: job});
server.server();

//console.log(j.nextInvocation())