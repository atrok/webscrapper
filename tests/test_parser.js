
var requester = require('../lib/parse').requester;
var parser_85component_releaseslist = require('../lib/parse').parser_85component_releaseslist;
var parser_85releasepage=require('../lib/parse').parser_85releasepage;
var rootCas = require('ssl-root-cas').create();
var path = require('path');
var { getlinks, findrelease,savetodb} = require('../db/dbconfig');

//var opts={ startkey: [args, ""], endkey: [args, {}], group: true, reduce: true, inclusive_end: true }


rootCas
    .addFile(path.join(__dirname, '../security/godaddy_g2.cer'))
    ;

var options = {
    url: 'https://docs.genesys.com/Documentation/RN/8.5.x/wde85rn/wde85rn',
    ca: rootCas,
    agentOptions: {
        secureProtocol: 'TLSv1_2_method'
    },
    search: {
        solution_name: "Workspace Desktop Edition",
        component: "Workspace Desktop Edition",
        family: "8.5",
        release: "",
        url: ""
    }
};

var v = async () => {
    var newreleases=[];
    var releaseslist = await requester(options, parser_85component_releaseslist);

    for (var i=0;i<releaseslist.length;i++){
        var opts=releaseslist[i];
        var release=await findrelease(opts);
        if(release.length==0){ //release not found, parse the page
            options.url=opts.url;
            options.search=opts;
            var parsedrelease = await requester(options, parser_85releasepage);
           console.log(JSON.stringify(parsedrelease));
        }
    };
}

v();