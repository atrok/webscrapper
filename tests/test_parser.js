
var {requestHandler,parsers}=require('../lib/parse');
var logger=require('../lib/logger');
var rootCas = require('ssl-root-cas').create();
var path = require('path');
var { getlinks, findrelease,savetodb,init} = require('../db/dbconfig');
var testdbconfig=require('./dbsettings_for_tests');

//init database with test settings
init(testdbconfig);

//var opts={ startkey: [args, ""], endkey: [args, {}], group: true, reduce: true, inclusive_end: true }


rootCas
    .addFile(path.join(__dirname, '../security/godaddy_g2.cer'))
    ;

var options = {
    url: 'https://docs.genesys.com/Documentation/ST/latest/RNs/LFMTClient',
    ca: rootCas,
    agentOptions: {
        secureProtocol: 'TLSv1_2_method'
    },
    search: {
        solution_name: "Genesys Care Tools",
        component: "Log File Management Tool Client",
        family: "8.5",
        release: "",
        "release-link-href": ""
    }
};

var v = async (logger) => {
    
    try{
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

}catch(exc){
    console.log(exc.stack)
}
}

v(logger);