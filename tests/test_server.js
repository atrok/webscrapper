configuration = {
    server: {
        database: {
            dbtype: "couchdb", // leave as is
            couchdb_host: '192.168.14.91',
            couchdb_port: 5984,
            couchdb_username: 'admin',
            couchdb_pass: 'Genesys#1',
            dbname: "genesys_releases_bk"
        },
        http_port: 13030,
        title: "Test Web Scrapper Service "
    },
scrapperConfig: {
        logger: null,
        starturl: 'http://localhost:5000/RN',
        connection_string: null
    }

}

var serverCreate = require('../server');

var server = serverCreate(configuration);
server.start();