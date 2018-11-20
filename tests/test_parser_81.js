var logger=require('../lib/logger');
var requester = require('../lib/parse').requester;
var parsers = require('../lib/parse').parsers;

var rootCas = require('ssl-root-cas').create();
var path = require('path');
var { getlinks, findrelease,savetodb} = require('../db/dbconfig');

//var opts={ startkey: [args, ""], endkey: [args, {}], group: true, reduce: true, inclusive_end: true }


rootCas
    .addFile(path.join(__dirname, '../security/godaddy_g2.cer'))
    ;

var options = {
    url: 'https://docs.genesys.com/Special:Repository/mm_web_dotnet81rn.html?id=376c2fc3-7261-4fb7-92f1-5b1ec9a0bc02',
    ca: rootCas,
    agentOptions: {
        secureProtocol: 'TLSv1_2_method'
    },
    search: {
        solution_name: "eServices",
        component: ".NET Web API Server and Samples",
        family: "8.1",
        release: "",
        "release-link-href": "https://docs.genesys.com/Special:Repository/mm_web_dotnet81rn.html?id=376c2fc3-7261-4fb7-92f1-5b1ec9a0bc02"
    }
};

var v = async () => {
    var newreleases=[];
    var releaseslist = await requester(options, parsers.releaselist);

    for (var i=0;i<releaseslist.length;i++){
        var opts=releaseslist[i];
        var release=await findrelease(opts);
        if(release.length==0){ //release not found, parse the page
            options.url=opts["release-link-href"];
            options.search=opts;
            var parsedrelease = await requester(options, parsers.page);
           logger.info(JSON.stringify(parsedrelease));

           await savetodb(parsedrelease);

        }
    };
}

v();