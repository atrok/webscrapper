
var { requestHandler, parsers } = require('../lib/parse');
var logger = require('../lib/logger');
var rootCas = require('ssl-root-cas').create();
var path = require('path');
var { getlinks, findrelease, savetodb } = require('../db/dbconfig');

//var opts={ startkey: [args, ""], endkey: [args, {}], group: true, reduce: true, inclusive_end: true }


rootCas
    .addFile(path.join(__dirname, '../security/godaddy_g2.cer'))
    ;

var options = {
    url: 'https://docs.genesys.com/Documentation/RN#t-1',
    ca: rootCas,
    agentOptions: {
        secureProtocol: 'TLSv1_2_method'
    },
    search: {
        solution_name: "",
        component: "",
        family: "",
        release: "",
        "release-link-href": ""
    }
};

var v = async (logger) => {

    try {
        var requester = requestHandler();
        var links = await requester.run(options, parsers.componentlinks);

        for (var i = 0; i < links.length; i++) {

        };

    } catch (exc) {
        console.log(exc.stack)
    }
}

v(logger);