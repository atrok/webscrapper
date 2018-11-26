var logger=require('../lib/logger');
var {requestHandler,parsers} = require('../lib/parse');

var rootCas = require('ssl-root-cas').create();
var path = require('path');
var { getlinks, findrelease,savetodb} = require('../db/dbconfig');

//var opts={ startkey: [args, ""], endkey: [args, {}], group: true, reduce: true, inclusive_end: true }


rootCas
    .addFile(path.join(__dirname, '../security/godaddy_g2.cer'))
    ;

var options = {
    url: 'https://docs.genesys.com/Special:Repository/gqm81rn.html?id=72e19a39-80c3-4793-9e99-fd5dcf7716df',
    ca: rootCas,
    agentOptions: {
        secureProtocol: 'TLSv1_2_method'
    },
    search: {
        solution_name: "eServices",
        component: "Universal Contact Server",
        family: "8.1",
        release: "",
        "release-link-href": "https://docs.genesys.com/Special:Repository/gqm81rn.html?id=72e19a39-80c3-4793-9e99-fd5dcf7716df"
    }
};

var v = async () => {
    var newreleases=[];
    var requester=requestHandler();
    var releaseslist = await requester.run(options, parsers.releaselist);

    for (var i=0;i<releaseslist.length;i++){
        var opts=releaseslist[i];
        var release=await findrelease(opts);
        if(release.length==0){ //release not found, parse the page
            options.url=opts["release-link-href"];
            options.search=opts;
            var parsedrelease = await requester.run(options, parsers.page);
           logger.info(JSON.stringify(parsedrelease));

           await savetodb(parsedrelease);

        }
    };
}

v();