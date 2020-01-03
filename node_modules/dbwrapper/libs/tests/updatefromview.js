var { dbwrapper, couchdb_requests } = require('../../index');

var connection_string = {
    dbtype: "couchdb",
    couchdb_host: '127.0.0.1',
    couchdb_port: 5984,
    couchdb_username: 'admin',
    couchdb_pass: '',
}

var dbname = "genesys_releases";

// get instance of couchdb
var db = dbwrapper.getInstance(
    connection_string
);


var query = couchdb_requests.query;
query.params.dbname = dbname;
query.params.view = "trtr/new-view";
query.params.opts = { keys: ["Universal Contact Server"], inclusive_end: true, include_docs: true }

var update = couchdb_requests.update;
update.params.dbname = dbname;
update.params.result = {
    "parameter": "saved",
    "updated": new Date()
}

var get = couchdb_requests.get;
get.params.dbname = dbname;
get.params.id = "";

var run = async function (dbs) {

    var db = dbs;

    try {

        var res = await db.handleRequest(query);

        res.forEach(async obj => {

            update.params.id = obj._id;
            update.params.revid = obj._rev;

            if (obj["family"] == '9.1') {

                obj["solution_name"] = 'eServices';
            }

            update.params.result = obj;
            var r = await db.handleRequest(update);

            console.log(r);
        })

    } catch (err) {
        console.log(err)
    }
}

run(db);