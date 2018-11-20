var CouchDB = require('./couchdb').CouchDB;

var couchdb = null;
var logger = null;

var couchdbwrapper = function () { }

couchdbwrapper.prototype.addConfiguration = function (connection_string) {
    couchdb = new CouchDB({ host: connection_string.couchdb_host, port: connection_string.couchdb_port, username: connection_string.couchdb_username, password: connection_string.couchdb_pass });
    return this;
}

couchdbwrapper.prototype.handleRequest = function (args) {
    try {
        var fn=actions[args.request];
        return fn(args.params);
    } catch (ex) {
        throw ex;
    }

}

couchdbwrapper.prototype.assignlogger = function (l) {
    logger = l;
}

var actions = {
    remove: async function (params) {

        //var response = params.response | undefined;
        var id = params.id || undefined;
        var revid = params.revid || undefined;
        var dbname = params.dbname || undefined;
        try {
            // var logger = new Logger(response);

            if (typeof dbname === 'undefined') {
                throw new Error('DB name is not provided');
            }


            if (typeof id === 'undefined') {
                throw new Error('record id is not provided');
            }



            var db = couchdb.getDBConnection(dbname);

            if (typeof revid===undefined) {
                revid = await getRevision(db, id);
            }

            return new Promise((resolve, reject) => {
                db.remove(id, revid, function (err, res) {
                    if (err) {
                        reject(err);
                        return;
                    } else {
                        console.log('deleted: ' + id + ' revid:' + revid);
                        resolve(res);
                    }
                });
            });

        } catch (err) {
            console.log(err.stack);
            throw err;
        }
    },

    createView: async function(params){
        try {

            var dbname = params.dbname || undefined;
            var view = params.view || undefined;
            var revid = params.revis || undefined;
            var func = params.func || undefined;

            if (typeof dbname === 'undefined') {
                throw new Error('DB name is not provided');
            }

           

            if (typeof view === 'undefined') {
                throw new Error('view name is not provided');
            }


            if (typeof func === 'undefined') {
                throw new Error('func is not defined, view can\' be empty');
            }


            //var db = couchdb.getDBConnection(dbname);
            
            return new Promise(async (resolve, reject) => {
                try{
                var res = await couchdb.save_async(dbname, view, revid,func);
                
                resolve(res);
                }catch(exc){
                    reject(exc);
                }
            })
        } catch (err) {
            console.log(err.stack);
            throw err;
        }
    },
    save: async function (params) {

        try {
            //var logger = new Logger(response);

            //var response = params.response | undefined;
            var result = params.result || undefined;
            var dbname = params.dbname || undefined;

            if (typeof dbname === 'undefined') {
                throw new Error('DB name is not provided');
            }


            if (typeof result === 'undefined') {
                throw new Error('result is not provided');
            }

            //var db = couchdb.getDBConnection(dbname);
            result.time = new Date().toString();
            return new Promise(async (resolve, reject) => {
                try{
                var res = await couchdb.save(dbname, result);
                res.time = result.time;
                resolve(res);
                }catch(exc){
                    reject(exc);
                }
            })
        } catch (err) {
            console.log(err.stack);
            throw err;
        }
    },

    update: async function (params) {

        try {

            var result = params.result || undefined;
            var id = params.id || undefined;
            var revid = params.revid || undefined;
            var dbname = params.dbname || undefined;

            // var logger = new Logger(response);

            if (typeof dbname === 'undefined') {
                throw new Error('DB name is not provided');
            }


            if (typeof id === 'undefined') {
                throw new Error('record id is not provided');
            }

            if (typeof result === 'undefined') {
                throw new Error('result is not provided');
            }

            var db = couchdb.getDBConnection(dbname);

            if (typeof revid==='undefined') {
                revid = await actions.getRevision(db, id);
            }

            return new Promise((resolve, reject) => {
                result.updated = new Date().toString();
                db.save(id, revid, result, function (err, res) {
                    if (err) {
                        reject(err);
                        return;
                    } else {
                        logger.trace('updated: ' + id + ' revid:' + revid);
                        res.updated = result.updated;
                        resolve(res);
                    }
                });
            });

        } catch (err) {
            console.log(err.stack);
            throw err;
        }
    },



    getRevision: function (db, id) {
        return new Promise((resolve, reject) => {
            db.get(id, function (err, doc) {
                if (err) {
                    reject(err);
                    return;
                } else {

                    console.log('Resolved revId:', doc._rev);
                    resolve(doc._rev);
                }
            });
        })
    },

    query: (params) => {

        var response = params.response || null;
        var view = params.view || undefined;
        var dbname = params.dbname || undefined;
        var localOpts = (!params.opts) ? localOpts = { group: true } : localOpts = params.opts;

        // var logger = new Logger(response);

        if (typeof dbname === 'undefined') {
            throw new Error('DB name is not provided');
        }


        if (typeof view === 'undefined') {
            throw new Error('view name is not provided');
        }



        return new Promise(async (resolve, reject) => {

            try {
                couchdb.getDBConnection(dbname);

                var res = await couchdb.select(view, localOpts, response);

                //            var rows = res.rows;

                //    rows.forEach(function(value,key){
                //        logger.log(value.key.toString());
                //    })
                resolve(res);
            } catch (err) {
                console.log(err.stack);
                reject(err);
            }
        });
    },

    get: (params) => {


        var response = params.response || null;
        var id = params.id || undefined;
        var dbname = params.dbname || undefined;

        // var logger = new Logger(response);

        if (typeof dbname === 'undefined') {
            throw new Error('DB name is not provided');
        }


        if (typeof id === 'undefined') {
            throw new Error('record id is not provided');
        }


        return new Promise(async (resolve, reject) => {

            try {
                couchdb.getDBConnection(dbname);

                var res = await couchdb.get(id, response);



                //    rows.forEach(function(value,key){
                //        logger.log(value.key.toString());
                //    })
                resolve(res);
            } catch (err) {
                console.log(err.stack);
                reject(err);
            }
        });
    },

    init: async function (params) {

        var response = params.response || null;
        var dbname = params.dbname || undefined;

        if (typeof dbname === 'undefined')
        couchdbwrapper.logger.info('DB name is not provided, using default set name');

        couchdb.getDBConnection(dbname);

        try {
            var res = await couchdb.initialize("true", response);

            var history_record = await this.prepare_history_record();
            var s = await save(response, history_record, "uahelper_history", );
            couchdbwrapper.logger.info("Saving to uahelper_history results: " + s);
            return res;

        } catch (err) {
            throw err;
        }
    },

    prepare_history_record: async function () {

        return new Promise(async (resolve, reject) => {
            try {
                var rec = {};
                var inf = await this.info();
                rec.db_name = inf.db_name;
                rec.sizes = inf.sizes;
                rec.doc_count = inf.doc_count;
                resolve(rec);
            } catch (err) {
                reject(err)
            }
        })

    },

    info: function (params) {

        var response = params.response || null;
        var dbname = params.dbname || undefined;

        if (typeof dbname === 'undefined')
            logger.info('DB name is not provided, using default set name');

        return new Promise((resolve, reject) => {
            //var logger = new Logger(response);
            if (typeof dbname === 'undefined')
            couchdbwrapper.logger.info('DB name is not provided, using default set name');

            var db = couchdb.getDBConnection(dbname);
            db.info(function (err, res) {
                if (err) { reject(err) }

                console.log(res);
                resolve(res);
            });

        })
    },

    isviewexists: function(params){
        var response = params.response || null;
        var view = params.view || undefined;
        var dbname = params.dbname || undefined;

        couchdb.getDBConnection(dbname);

        return couchdb.isviewexists(response,view);

    }

}
module.exports = couchdbwrapper;