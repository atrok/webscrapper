var { dbwrapper, couchdb_requests } = require('./index');

var connection_string = {
    dbtype: "couchdb",
    couchdb_host: '192.168.14.92',
    couchdb_port: 5984,
    couchdb_username: 'admin',
    couchdb_pass: 'Genesys#1',
}

var dbname = "dbwrapper_test";

// get instance of couchdb
var db = dbwrapper.getInstance(
    connection_string
);

var save = couchdb_requests.save;
save.params.dbname = "dbwrapper_test";
save.params.result = {
    "parameter": "saved"
}

var update = couchdb_requests.update;
update.params.dbname = dbname;
update.params.result = {
    "parameter": "saved",
    "updated": new Date()
}

var createview = couchdb_requests.createView;
createview.params.dbname = dbname;
createview.params.view = "_design/dbwrapper_test";
createview.params.func = {
    all: {
        map: function (doc) {
            emit(doc.id, doc);
        }
    }
}

var query=couchdb_requests.query;
query.params.dbname=dbname;
query.params.view="dbwrapper_test/all";
query.params.opts={ inclusive_end: true }

var get=couchdb_requests.get;
get.params.dbname=dbname;

var remove=couchdb_requests.remove;
remove.params.dbname=dbname;

var info=couchdb_requests.info;
info.params.dbname=dbname;

var run_test = async function () {
    try {
        var res = await db.handleRequest(save);
        update.params.id = res.id;

        var res = await db.handleRequest(update);

        var res = await db.handleRequest(createview);

        var res = await db.handleRequest(query)

        get.params.id=res[0].id;

        var res = await db.handleRequest(get);

        remove.params.id=get.params.id;

        var res = await db.handleRequest(remove);

        var res = await db.handleRequest(info)
        console.log(res);

    } catch (err) {
        console.log(err)
    }
}

run_test();


