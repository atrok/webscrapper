var couchdb_requests = require('dbwrapper').couchdb_requests;
var dbwrapper = require('dbwrapper').dbwrapper;
var logger = require('../lib/logger');

var dbconfig = {
    connection_string: {
        dbtype: "couchdb",
        couchdb_host: '10.12.60.130',
        couchdb_port: 5984,
        couchdb_username: 'admin',
        couchdb_pass: 'Genesys#1',
        dbname: "genesys_releases"
    },
    //dbname: "test",
    _design: "_design",
    views: {
        links: {
            design_doc_name: "scrapper_links",
            designdocument: "_design/scrapper_links",
            path: "scrapper_links/links",
            name: "links",
            func: {
                links: {
                    map: function (doc) {
                        if (doc.solution_name && doc.component && doc.family && doc["component-href"]) {
                            emit([doc.solution_name, doc.component, doc.family, doc["component-href"]], 1);
                        }
                    },
                    reduce: "_count"
                }
            },
            exists: false
        },
        releases: {
            design_doc_name: "scrapper_releases",
            designdocument: "_design/scrapper_releases",
            path: "scrapper_releases/releases",
            name: "releases",
            func: {
                releases: {
                    map: function (doc) {
                        if (doc.solution_name && doc.component && doc.family && doc.release) {
                            emit([doc.solution_name, doc.component, doc.family, doc.release], 1);
                        }
                    },
                    reduce: "_count"
                }
            },
            exists: false,
        }
    }
}











var isViewExists = async function (viewname) {
    //dbconfig.connection_string.dbname;
    var checkview = couchdb_requests.isviewexists;
    checkview.params.dbname = dbconfig.connection_string.dbname;
    checkview.params.view = viewname;

    return execute(checkview);

}
var getlinks = async function () {
    var query = couchdb_requests.query;
    query.params.dbname = dbconfig.connection_string.dbname;
    query.params.view = dbconfig.views.links.path;
    query.params.opts = { group: true, inclusive_end: true };

    try {
        logger.info("getlinks")

        await checkView(dbconfig.views.links);

        return await execute(query);
    } catch (exc) {
        throw exc;
    }
}


var checkView = async function (view) {
    var createview = couchdb_requests.createView;
    createview.params.dbname = dbconfig.connection_string.dbname;

    return new Promise(async (resolve, reject) => {
        //logger.debug("Checking ${view} exists");

        try {
            if (!view.exists) { // check locally stored value to avoid hitting database on every query request 

                var b = await isViewExists(view.name); // local value is false, go ahead checking in db
                if (!b) {

                    createview.params.view = view.designdocument;
                    createview.params.func = view.func;
                    await execute(createview);

                }
                view.exists = true; // cache view existence to local variable
            }
            resolve()
        } catch (exc) {
            reject(exc);
        }
    })

}


var findrelease = async function (args) {
    // get instance of couchdb
    try {
        await checkView(dbconfig.views.releases);

        var query = couchdb_requests.query;
        query.params.dbname = dbconfig.connection_string.dbname;

        if (!args) {
            throw new Error("Query options aren't provided")
        }
        var sk = [];
        var ek = [];

        // create query options
        // [doc.solution_name, doc.component, doc.family, doc.release,doc["release-link-href"]]
        var keys = ['solution_name', 'component', 'family', 'release'];

        keys.forEach(key => {

            if (args[key] == null) {
                throw new Error('Expected keyname ' + key + ' is not found in provided options array ' + JSON.stringify(args));
            }

            try {

                sk.push(args[key]);
                ek.push(args[key]);
            } catch (err) {
                throw new Error('Expected keyname is not found in provided options array');
            }

        })

        // ek[ek.length - 1] = {}

        var opts = { startkey: sk, endkey: ek, group: true, reduce: true, inclusive_end: true }

        query.params.opts = opts;
        query.params.view = dbconfig.views.releases.path;

        //logger.info("get releases" + options);
        var t = execute(query);
        return t;
    } catch (exc) {
        throw exc;
    }
}

var savetodb = function (result) {
    try {
        var save = couchdb_requests.save;
        save.params.dbname = dbconfig.connection_string.dbname;
        save.params.result = result;
        return execute(save);
    } catch (exc) {
        throw exc
    }
}




var execute = function (params) {
    return new Promise(async (resolve, reject) => {
        try {
            logger.debug("Sending to DB:" + JSON.stringify(params.request));
            var db = dbwrapper.getInstance(dbconfig.connection_string);
            var res = await db.handleRequest(params);
            resolve(res);
        } catch (exc) {
            reject(exc)
        }
    })
}

var init = function (arg) {

    dbconfig = Object.assign(dbconfig, arg);

}

module.exports = {
    getlinks,
    findrelease,
    savetodb,
    init,
    dbconfig: {
        connection_string: {
            dbtype: "couchdb",
            couchdb_port: 5984,
            couchdb_host: '',
            couchdb_username: '',
            couchdb_pass: '',
            dbname: ""
        }
    }
};
