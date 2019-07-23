var app = require('express')();
var http = require('http').Server(app);
var logger = require('./lib/winstonlogger');
var io = require('socket.io')(http);
var schedule = require('node-schedule');
var scrapper = require('./scrapper');
var x=require('./lib/json2html');
var { performance } = require('perf_hooks');


var scrapperConfig = {
    logger: logger,
    starturl: 'https://docs.genesys.com/Documentation/RN',
    connection_string: null
};


var serverProto = {

    jobs: [],
    start: function start() { }

}

function serverCreate(options) {


    var obj = Object.assign(Object.create(serverProto), options);

    scrapperConfig.connection_string=obj.configuration.database;
    
    obj.start = function () {
        that = this;

        app.get('/', function (req, res) {
            res.writeHead(200, { "Content-Type": "text/html" });

            res.write('<h1>Genesys Release notes webscrapper service</h1>');

            res.write('<table><tr><th>JOB ID</th><th>Next Run</th><th>Invocations</th><th>Start url</th><th>Status</th><th>Progress</th></tr>')

            that.jobs.forEach(o=>{
                let report=o.scrapper.report();
                let nextinvocation=(o.scheduledJob.nextInvocation())?o.scheduledJob.nextInvocation().toString():"no";

                let progress=o.progress.current+" out of "+o.progress.total+", Finishes in: "+Math.floor(o.progress.eta()/1000)+' sec';

                res.write('<tr><td><a href="/report?id='+o.id+'">'+o.id+'</a></td><td>'+nextinvocation+'</td><td>'+report["invocations"] +'</td><td>'+o.scrapper.starturl+'</td><td>'+o.status+'</td><td>'+progress+'</td></tr>' );
                //res.write('<tr><td><a href="/report?id='+o.id+'">'+o.id+'</a></td><td></td><td>'+report.invocations +'</td><td>'+o.scrapper.starturl+'</td><td>'+o.status+'</td></tr>' );
            })
            res.write('</table>')

            res.write('<p><a href="/startimmediate">Start job immediately</a></p>');
            res.end();
            //res.send('<p>'+this.job.scheduledJob.nextInvocation().toString()+'</p>');
        });

        app.get('/startimmediate', function (req, res) {

            res.writeHead(200, { "Content-Type": "text/html" });

            let startTime = new Date(Date.now() + 1000);
            //let endTime = new Date(startTime.getTime() + 60000);

            var immediatejob=createScrapperJob(startTime);

            res.write('<h1>Genesys Release notes webscrapper service</h1>');
            res.write('<p>Job is created: <a href="/report?id='+immediatejob.id+'">'+immediatejob.id+'</a></p>');

            res.end();
            //res.send('<p>'+this.job.scheduledJob.nextInvocation().toString()+'</p>');
        });

        app.get('/report', function (req, res) {

            var url=require('url').parse(req.url, true);

            res.writeHead(200, { "Content-Type": "text/html" });
            res.write('<h1>Genesys Release notes webscrapper service</h1>');

            if(url.query.id){
                that.jobs.forEach(o => {
                    if(o.id==url.query.id){
                        res.write('<p>Job ' + o.id + ' is ' + o.status+'</p>');
                        res.write('<p>'+x.toHtml(o.scrapper.report())+'</p>');

                    }
                });
            }

            res.write('<p><a href="/">Home</a></p>');
            res.end();
        });

        //http.listen(3030, function () {
        http.listen(obj.configuration.http_port, function () {
            logger.info('Web Scrapper server is listening on *:'+obj.configuration.http_port);
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

        // create scheduled scrapper job

        function createScrapperJob(when){
            var scr = scrapper.scrapperCreate(scrapperConfig);

            var job = {
                id: Date.now(),
                scheduledJob: null,
                status: 'Stopped',
                progress: {
                    starttime:0,
                    exectime_avg: function exectime_avg(){
                        return (job.progress.current==0)?0:Math.floor((performance.now()-job.progress.starttime)/job.progress.current);
                    },
                    endtime:0,
                    eta:function eta(){
                        return (job.progress.total-job.progress.current)*job.progress.exectime_avg();
                    },
                    current:0,
                    total:0
                },
                scrapper: scr,
            }

            job.scheduledJob = schedule.scheduleJob(when, function () {
                logger.info('Scheduled job is starting: '+job.id);
                    
                job.scrapper.on('started',()=>{
                    job.status='Running';
                    job.progress.starttime=performance.now();
                    job.progress.stagetime=performance.now();
                })

                job.scrapper.on('done',()=>{
                    job.status='Stopped';
                    job.progress.current=0;
                    job.progress.total=0;
                    job.progress.endtime=performance.now();
                })

                job.scrapper.on('progress',(current, total)=>{
                    job.progress.current=current;
                    job.progress.total=total;

                   // let done=(Math.floor((current/total)*100)==0)?1:Math.floor((current/total)*100;
                    
                    //job.progress.eta=(total-current)*job.progress.stagetime; 


                    
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