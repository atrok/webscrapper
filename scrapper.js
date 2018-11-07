var path = require('path');
var getlinks = require('./db/dbconfig').getlinks;
var parser=require('./lib/parse');
var rootCas = require('ssl-root-cas').create();

rootCas
    .addFile(path.join(__dirname, 'security/godaddy_g2.cer'))
    ;

//caFile = path.resolve(__dirname, 'security/godaddy_g2.cer')


var options = {
    url: 'https://docs.genesys.com/Documentation/RN#t-2',
    ca: rootCas,
    agentOptions: {
        secureProtocol: 'TLSv1_2_method'
    }
};

getlinks().then(async res => {

    var rn=res;

    for(var i=0;i<rn.length;i++){
        var value=rn[i].key;
        options.search.solution_name=value[0];
        options.search.component=value[1];
        options.search.family=value[2];
        options.search.url=value[3];
        

        //console.log("Calling "+options.url);

        var res=await parser(options);

    }

})

