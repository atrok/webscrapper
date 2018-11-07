var couchdb_requests = require('dbwrapper').couchdb_requests;
var dbwrapper = require('dbwrapper').dbwrapper;

var dbconfig = {
    connection_string: {
        dbtype: "couchdb",
        couchdb_host: '192.168.14.92',
        couchdb_port: 5984,
        couchdb_username: 'admin',
        couchdb_pass: 'Genesys#1',
        dbname: "genesys_releases",
        designdocument: "_design/scrapper",
        views: {
            links: {
                name: "scrapper/links",
                func: {
                    map: function (doc) {
                        if (doc.solution_name && doc.component && doc.family && doc["component-href"]) {
                            emit([doc.solution_name, doc.component, doc.family, doc["component-href"]], 1);
                        }
                    },
                    reduce: "_count"
                }
            },
            releases: {
                name: "scrapper/releases",
                func: {
                    map: function (doc) {
                        if (doc.solution_name && doc.component && doc.family && doc.release) {
                            emit([doc.solution_name, doc.component, doc.family, doc.release,doc["release-link-href"]], 1);
                        }
                    },
                    reduce: "_count"
                }
            }
        }
    }
}

var query = couchdb_requests.query;
query.params.dbname = dbconfig.connection_string.dbname;
query.params.view = dbconfig.connection_string.views.links.name;
query.params.opts = { group: true, inclusive_end: true };

var createview = couchdb_requests.createView;
createview.params.dbname = dbconfig.connection_string.dbname;
createview.params.view = dbconfig.connection_string.designdocument;
createview.params.func = {
    links: dbconfig.connection_string.views.links.func
}

var createview = couchdb_requests.createView;
createview.params.dbname = dbconfig.connection_string.dbname;
createview.params.view = dbconfig.connection_string.designdocument;
createview.params.func = {
    links: {
        map: function (doc) {
            if (doc.solution_name && doc.component && doc.family && doc["component-href"]) {
                emit([doc.solution_name, doc.component, doc.family, doc["component-href"]], 1);
            }
        },
        reduce: "_count"
    }
}

var save = couchdb_requests.save;
save.params.dbname = dbconfig.connection_string.dbname;

var getlinks = async function () {
    // get instance of couchdb
    console.log("getlinks")
    return await execute(query);
}


var findrelease = function (args) {
    // get instance of couchdb

    var query=couchdb_requests.query;

    if (!args) {
        throw new Error("Query options aren't provided")
    }
    var sk = [];
    var ek = [];

    Object.getOwnPropertyNames(args).forEach(element => {
        sk.push(args[element]);
        ek.push(args[element]);
    })

    ek[ek.length - 1] = {}

    var opts = { startkey: sk, endkey: ek, group: true, reduce: true, inclusive_end: true }

    query.params.opts = opts;
    query.params.view = dbconfig.connection_string.views.releases.name;

    //console.log("get releases" + options);
    var t=execute(query);
    return t;
}

var savetodb = function (result) {

    save.params.result = result;
    return  execute(save);
}

var execute = function (params) {
    return new Promise(async (resolve, reject) => {
        try {
            var db = dbwrapper.getInstance(dbconfig.connection_string);
            var res = await db.handleRequest(params);
            resolve(res);
        } catch (exc) {
            reject(exc)
        }
    })
}

module.exports = {
    getlinks,
    findrelease,
    savetodb

};
