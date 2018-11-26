var path = require('path');
var { getlinks, findrelease, savetodb } = require('./db/dbconfig');
var { requestHandler, parsers } = require('./lib/parse');
//var requester = require('./lib/parse');
var rootCas = require('ssl-root-cas').create();
var logger = require('./lib/logger');
var { performance } = require('perf_hooks');
var utils = require('./lib/utils');
var logger = require('./lib/winstonlogger');



rootCas
    .addFile(path.join(__dirname, 'security/godaddy_g2.cer'))
    ;

//caFile = path.resolve(__dirname, 'security/godaddy_g2.cer')


var options = {
    url: '',
    ca: rootCas,
    agentOptions: {
        secureProtocol: 'TLSv1_2_method'
    },
    search: {}
};


var scrapperProto = {
    start: function start() {
        var that = this;

        var requester = requestHandler();

        var report = {
            last_execution_time: new Date(),
            errors: []
        };

        getlinks().then(async res => {

            var rn = res;
            var execution_report = [];

            var t0 = performance.now();
            for (var i = 0; i < rn.length; i++) {


                var value = rn[i].key;

                options.search.solution_name = value[0];
                options.search.component = value[1];
                options.search.family = value[2];
                options.search['component-href'] = value[3];
                //options.search=value;



                options.url = value[3];

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
                            repObj.executiontime = performance.now() - t1;
                            execution_report.push(repObj);
                        }
                    };
                } catch (err) {
                    report.errors.push({ search: options.search, error: err.message });
                }
                report.report = execution_report;

            }

            report.execution_duration = Math.floor((performance.now() - t0) / 1000);
            that.store(report);

            logger.debug(JSON.stringify(report, null, 2));
            logger.info("Execution time: " + report.execution_duration + 'sec')


        }).catch(err => logger.error(err.stack));
    },
    store: function store() { },
    report: function report() { }

}


function scrapperCreate(options) {

    var rep = { invocations: 0 };

    var obj = Object.assign(Object.create(scrapperProto), options);

    obj.store = function store(r) {
        rep.invocations++;
        rep = Object.assign(rep, r);
    };

    obj.report = function report() {
        console.log(JSON.stringify(rep));
        return (rep) ? JSON.stringify(rep) : "Report is not populated yet."
    }



    return obj;
}

module.exports = {
    scrapperCreate: scrapperCreate
}
