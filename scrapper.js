var path = require('path');
var { init, getlinks, findrelease, savetodb } = require('./db/dbconfig');
var { requestHandler, parsers } = require('./lib/parse');
//var requester = require('./lib/parse');
var rootCas = require('ssl-root-cas').create();
var logger = require('./lib/logger');
var { performance } = require('perf_hooks');
var utils = require('./lib/utils');
var logger = require('./lib/winstonlogger');

const EventEmitter = require('events');



rootCas
    .addFile(path.join(__dirname, 'security/godaddy_g2.cer'))
    ;

//caFile = path.resolve(__dirname, 'security/godaddy_g2.cer')


var optionsProto = {
    url: '',
    ca: rootCas,
    agentOptions: {
        secureProtocol: 'TLSv1_2_method'
    },
    search: {}
};


var scrapperProto = {
    start: async function start() {
        var that = this;

        that.emit('started');

        var requester = requestHandler({logger: that.logger});

        //init db 
        (that.connection_string)?init({connection_string: that.connection_string}):init();

        var report = {
            last_execution_time: new Date(),
            errors: [],
            execution_report:[]
        };
        

        var t0 = performance.now();
        var options=Object.assign({},optionsProto);
        options.url=that.starturl;

        try {
            var components = await requester.run(options, parsers.componentlinks);


            for (var i = 0; i < components.length; i++) {

                that.emit('progress', i, components.length);


                var value = components[i];

                //options.search.solution_name = value[0];
                //options.search.component = value[1];
                //options.search.family = value[2];
                //options.search['component-href'] = value[3];
                options.search = value;



                options.url = value['component-href'];

                logger.info("Calling " + options.url);

                try {
                    var releaseslist = await requester.run(options, parsers.releaselist);

                    for (var ii = 0; ii < releaseslist.length; ii++) {
                        var t1 = performance.now();
                        var opts = releaseslist[ii];
                        var release = await findrelease(opts);
                        if (release.length == 0) { //release not found, parse the page
                            options.url = opts["release-link-href"];
                            options.search = opts;
                            var parsedrelease = await requester.run(options, parsers.page);
                            logger.debug(JSON.stringify(parsedrelease));

                            await savetodb(parsedrelease);
                            var repObj = opts;
                            repObj.executiontime = Math.floor((performance.now() - t1)) + ' ms';
                            report.execution_report.push(repObj);
                        }
                    };
                } catch (err) {
                    report.errors.push({ search: options.search, error: err.message });
                }
                //report.report = execution_report;

            }
        } catch (err) {
            report.errors.push({ search: options.search, error: err.message });
        }

        report.execution_duration = Math.floor((performance.now() - t0) / 1000);
        that.store(report);

        that.emit('done');

        logger.info(JSON.stringify(report, null, 2));
        logger.info("Execution time: " + report.execution_duration + 'sec')


    },
    store: function store() { },
    report: function report() { }

}


function scrapperCreate(options) {

    var rep = { invocations: 0 };

    
    var obj= Object.create(EventEmitter.prototype);
    var scr=Object.create(scrapperProto);
    obj = Object.assign(obj, scrapperProto, options);

    

    obj.store = function store(r) {
        rep.invocations++;
        rep = Object.assign(rep, r);
    };

    obj.report = function report() {
        console.log(JSON.stringify(rep,null,2));
        return (rep) ? JSON.stringify(rep,null,2) : "Report is not populated yet."
    }



    console.log(obj);

    return obj;
}

module.exports = {
    scrapperCreate: scrapperCreate
}
