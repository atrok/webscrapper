var app = require('express')();
var http = require('http').Server(app);
const path = require('path');
var serveIndex = require('serve-index')
var serveStatic = require('serve-static')
var createlogger = require('./lib/winstonlogger');
var io = require('socket.io')(http);
var schedule = require('node-schedule');
var scrapper = require('./scrapper');
var x = require('./lib/json2html');
var { performance } = require('perf_hooks');

//var logger=createlogger();

/*
var scrapperConfig = {
    logger: null,
    starturl: 'https://docs.genesys.com/Documentation/RN',
    //starturl: 'http://localhost:5000/RN',
    connection_string: null
};

*/

var serverProto = {

    jobs: [],
    start: function start() { }

}

app.use('/', serveStatic('client/build', { 'index': ['index.html', 'index.htm'] }))

function serverCreate(options) {

    var logger = createlogger();

    var obj = Object.assign(Object.create(serverProto), options.server);

    options.scrapperConfig.connection_string = obj.database;

    obj.start = function () {
        that = this;

        /*
        app.get('/', function (req, res) {

            res.sendFile(path.join(__dirname, '\\client\\build\\index.html'));

        });

        app.get('/startimmediate', function (req, res) {

            res.writeHead(200, { "Content-Type": "text/html" });

            let startTime = new Date(Date.now() + 1000);
            //let endTime = new Date(startTime.getTime() + 60000);

            var immediatejob = createScrapperJob(startTime);

            res.write('<h1>' + options.server.title + '</h1>');
            res.write('<p>Job is created: <a href="/report?id=' + immediatejob.id + '">' + immediatejob.id + '</a></p>');

            res.end();
            //res.send('<p>'+this.job.scheduledJob.nextInvocation().toString()+'</p>');
        });

        app.get('/report', function (req, res) {

            var url = require('url').parse(req.url, true);

            res.writeHead(200, { "Content-Type": "text/html" });
            res.write('<h1>' + options.server.title + '</h1>');

            if (url.query.id) {
                that.jobs.forEach(o => {
                    if (o.id == url.query.id) {
                        res.write('<p>Job ' + o.id + ' is ' + o.status + '</p>');
                        res.write('<p>' + x.toHtml(o.scrapper.report()) + '</p>');

                    }
                });
            }

            res.write('<p><a href="/">Home</a></p>');
            res.end();
        });
*/
        //htlogger function () {
        http.listen(obj.http_port, function () {
            logger.info(obj.title + " is listening on *:" + obj.http_port);
        });

        io.on('connection', function (socket) {

            logger.debug(" : New client " + socket.client.id + " connected to " + socket.id);

            io.emit('client data', getJobStatus());


            socket.on('start job', function (msg) {

                logger.debug("request to Start job")
                let startTime = new Date(Date.now() + 1000);
                //let endTime = new Date(startTime.getTime() + 60000);

                createScrapperJob(startTime);

                io.emit('client data', getJobStatus());

            });

            socket.on('stop job', function (msg) {
                io.emit('chat message', msg);
            });

            socket.on('job status', function (msg) {
                io.emit('chat message', msg);
            });

            socket.on('getReport', function (msg) {
                io.emit('report', getReport(msg));
            });

        });

        // prepare the list of jobs statuses

        function getReport(id) {

            if (!id) return { error: 'jobid is not defined' };

            var j = that.jobs.find(o => o.id == id);
            return { jobid: id, report: j.scrapper.report() };
        }


        function getJobStatus(id) {
            var msgdata = [];

            var j = that.jobs.filter(o => {

                if (!id) return true;// in case no id provided then return all array elements

                return (o.id == id) ? true : false; // otherwise return just updated element;

            })

            if (j === null) return { error: "Can't find job with id " + (id) ? id : "[empty]" };
            j.forEach(o => {
                let report = o.scrapper.report();
                let nextinvocation = (o.scheduledJob.nextInvocation()) ? o.scheduledJob.nextInvocation().toString() : "no";

                let progress = o.progress.current + " out of " + o.progress.total + ", Finishes in: " + Math.floor(o.progress.eta() / 1000) + ' sec';

                //x.toHtml(o.scrapper.report());
                msgdata.push(
                    {
                        jobid: o.id,
                        'next-run': nextinvocation,
                        invocations: report["invocations"],
                        url: o.scrapper.starturl,
                        status: o.status,
                        'progress': progress,
                        report: null
                    }
                );
                //res.write('<tr><td><a href="/report?id='+o.id+'">'+o.id+'</a></td><td>'+nextinvocation+'</td><td>'+report["invocations"] +'</td><td>'+o.scrapper.starturl+'</td><td>'+o.status+'</td><td>'+progress+'</td></tr>' );
                //res.write('<tr><td><a href="/report?id='+o.id+'">'+o.id+'</a></td><td></td><td>'+report.invocations +'</td><td>'+o.scrapper.starturl+'</td><td>'+o.status+'</td></tr>' );
            })

            console.log("server.getJobStatus()", msgdata);
            return msgdata;
        }

        // create scheduled scrapper job

        function createScrapperJob(when, scrapperConfig) {

            var scr = scrapper.scrapperCreate((scrapperConfig) ? scrapperConfig : options.scrapperConfig);


            var job = {
                id: Date.now(),
                scheduledJob: null,
                status: 'Stopped',
                progress: {
                    starttime: 0,
                    exectime_avg: function exectime_avg() {
                        return (job.progress.current == 0) ? 0 : Math.floor((performance.now() - job.progress.starttime) / job.progress.current);
                    },
                    endtime: 0,
                    eta: function eta() {
                        return (job.progress.total - job.progress.current) * job.progress.exectime_avg();
                    },
                    current: 0,
                    total: 0
                },
                scrapper: scr,
            }

            scr.logger = createlogger({ jobid: job.id });

            job.scheduledJob = schedule.scheduleJob(when, function () {
                logger.info('Scheduled job is starting: ' + job.id);

                job.scrapper.on('started', () => {
                    job.status = 'Running';
                    job.progress.starttime = performance.now();
                    job.progress.stagetime = performance.now();
                    io.emit('client data', getJobStatus(job.id));
                })

                job.scrapper.on('done', () => {
                    job.status = 'Stopped';
                    job.progress.current = 0;
                    job.progress.total = 0;
                    job.progress.endtime = performance.now();
                    io.emit('client data', getJobStatus());
                })

                job.scrapper.on('progress', (current, total) => {
                    job.progress.current = current;
                    job.progress.total = total;

                    // let done=(Math.floor((current/total)*100)==0)?1:Math.floor((current/total)*100;

                    //job.progress.eta=(total-current)*job.progress.stagetime; 

                    io.emit('client data', getJobStatus());


                })

                job.scrapper.on('log', (msg) => {

                    logger.info("Job: " + job.id + ", " + msg);

                })

                job.scrapper.start();
            });

            that.jobs.push(job);

            return job;
        }


        createScrapperJob({ hour: 23, minute: 59 });

    }
    return obj;
}

module.exports = serverCreate;