// rename the file into configuration.js and set the parameters as required.
configuration = {
    server: {
        database: {
            dbtype: "couchdb", // leave as is
            couchdb_host: '127.0.0.1',
            couchdb_port: 5984,
            couchdb_username: 'admin',
            couchdb_pass: 'Genesys#1',
            dbname: "genesys_releases"
        },
        http_port: 3030,
        title: "Genesys Release Notes Web Scrapper Service"
    },
    scrapperConfig: {
        logger: null,
        starturl: 'https://docs.genesys.com/Documentation/RN',
        connection_string: null
    }
}

module.exports = { configuration }