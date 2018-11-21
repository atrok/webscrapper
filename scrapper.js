var path = require('path');
var { getlinks, findrelease, savetodb } = require('./db/dbconfig');
var parsers = require('./lib/parse').parsers;
var requester = require('./lib/parse').requester;
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
        getlinks().then(async res => {

            var rn = res;
            var report = [];

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

                var releaseslist = await requester(options, parsers.releaselist);

                for (var ii = 0; ii < releaseslist.length; ii++) {
                    var t1 = performance.now();
                    var opts = releaseslist[ii];
                    var release = await findrelease(opts);
                    if (release.length == 0) { //release not found, parse the page
                        options.url = opts["release-link-href"];
                        options.search = opts;
                        var parsedrelease = await requester(options, parsers.page);
                        logger.debug(JSON.stringify(parsedrelease));

                        await savetodb(parsedrelease);
                        var repObj = opts;
                        repObj.executiontime = performance.now() - t1;
                        report.push(repObj);
                    }
                };

            }

            logger.debug(JSON.stringify(report, null, 2));
            logger.info("Execution time: " + (performance.now() - t0))


        }).catch(err => logger.error(err.stack));
    }
}


function scrapperCreate(options) {

    var obj=Object.assign(Object.create(scrapperProto), options);
    
    return obj;
}

module.exports={
    scrapperCreate: scrapperCreate
}
