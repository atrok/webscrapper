var logger = require('../lib/winstonlogger');
var scrapper = require('../scrapper').scrapperCreate({
    logger: logger, 
    starturl: 'http://localhost:5000/RN/',
    connection_string: {
        dbtype: "couchdb",
        couchdb_host: '192.168.14.92',
        couchdb_port: 5984,
        couchdb_username: 'admin',
        couchdb_pass: 'Genesys#1',
        dbname: "genesys_releases_bk"
    }
});

scrapper.start();