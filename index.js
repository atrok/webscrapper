var schedule = require('node-schedule');
var logger = require('./lib/winstonlogger');
var scrapper = require('./scrapper').scrapperCreate({
  logger: logger,
  starturl: 'https://docs.genesys.com/Documentation/RN',
  connection_string: {
    dbtype: "couchdb",
    couchdb_host: '192.168.14.91',
    couchdb_port: 5984,
    couchdb_username: 'admin',
    couchdb_pass: 'Genesys#1',
    dbname: "genesys_releases"
}
});

var serverCreate = require('./server');


var job = {
  scheduledJob: null,
  scrapper: scrapper,
  report: { invocations: 0 }
}

job.scheduledJob = schedule.scheduleJob({ hour: 23, minute: 59 }, function () {
  logger.info('Scheduled job is starting');
  job.report.invocations++;

  job.scrapper.start();
});

var server = serverCreate({ job: job });
server.server();

//console.log(j.nextInvocation())