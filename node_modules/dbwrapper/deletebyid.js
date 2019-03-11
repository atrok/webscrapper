var { dbwrapper, couchdb_requests } = require('./index');

var connection_string = {
    dbtype: "couchdb",
    couchdb_host: '192.168.14.91',
    couchdb_port: 5984,
    couchdb_username: 'admin',
    couchdb_pass: 'Genesys#1',
}

var dbname = "genesys_releases";

// get instance of couchdb
var db = dbwrapper.getInstance(
    connection_string
);


var query=couchdb_requests.query;
query.params.dbname=dbname;
query.params.view="test/group-releases-by-component";
query.params.opts={ startkey:["Genesys Administrator","8.1.311.03"], endkey:["Genesys Administrator","8.1.311.03"],inclusive_end: true, reduce: false, include_docs: true}


var remove=couchdb_requests.remove;
remove.params.dbname=dbname;

var get=couchdb_requests.get;
get.params.dbname=dbname;
get.params.id="";

var run = async function (dbs) {

    var db=dbs;

    try {
        
        var res = await db.handleRequest(query);

        res.forEach(async obj=>{

			remove.params.id=obj._id
			var r= await db.handleRequest(remove);

			//console.log(r);
		})
        
    } catch (err) {
        console.log(err)
    }
}

run(db);
