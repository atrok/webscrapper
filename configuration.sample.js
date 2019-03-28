// rename the file into configuration.js and set the parameters as required.
configuration={
database: {
    dbtype: "couchdb", // leave as is
    couchdb_host: '10.12.60.130',
    couchdb_port: 5984,
    couchdb_username: 'admin',
    couchdb_pass: 'Genesys#1',
    dbname: "genesys_releases"
},
http_port: 3030
}

module.exports={configuration}