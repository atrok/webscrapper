'use strict';

var cradle = require('cradle');
var Logger = require('./logger');

//const views_def = require('./queries/view_definitions');


cradle.setup({
  host: '192.168.14.91',
  port: 5984,
  cache: true,
  raw: false,
  forceSave: true
});




class CouchDB {


  constructor(params) {//{host, port, username, password, cache, raw, forceSave}
    this.cradle = cradle;

    this.cradle.setup({
      host: (null === params.host) ? '127.0.0.1' : params.host,
      port: (!params.port) ? 5984 : params.port,
      cache: (!params.cache) ? true : params.cache,
      raw: !(params.raw) ? false : params.raw,
      forceSave: (!params.forceSave) ? true : params.forceSave
    });

    this.username = params.username;
    this.password = params.password;

    this.view_all = 'all';
    this.view_group_releases_by_component = "group-releases-by-component";
    this.view_features_by_release = "features-by-release";
    this.database_name = 'sitemap-data-genesys_rn_85';

    this.db = null;


    this.isCreated = false;

    this.FULL_MASK = 0x7F;// 1111111

  }


  isviewexists(response, viewname) {
    var logger = new Logger(response);
    var db = this.db;

    return new Promise((resolve, reject) => {
      db.get('_all_docs', {
        startkey: "\"_design\"",
        endkey: "\"_design0\"",
        include_docs: true
      }, async function (err, res) {
        logger.log('Check exisiting views in _all_docs, processing results:');

        if (err) {

          if (res) {
            if (!res['rows']) err = res.json;
          }

          logger.log(err);
          reject(new Error("Failed to check views"));
          return;
        }


        try {
          res.rows.forEach(function (row) {
            logger.log('Design doc id: ' + row.id + ', rev: ' + row.value.rev);

            var views = Object.getOwnPropertyNames(row.doc.views);
            logger.debug("Looking for: " + viewname);
            if (views.find(x => x == viewname)) {
              logger.debug("Match!");
              resolve(true);
              return
            }


          })
          resolve(false);

        } catch (exc) {
          reject(exc)
        }

      })
    })
  }




  check_views(response, views_def) {
    var logger = response;
    var db = this.db;
    var database_name = this.database_name;
    var create_view = create_view;
    var FULL_MASK = this.FULL_MASK;
    return new Promise((resolve, reject) => {
      var mask = 0x0;



      logger.log("Start working with DB '" + database_name + "'");

      db.get('_all_docs', {
        startkey: "\"_design\"",
        endkey: "\"_design0\"",
        include_docs: true
      }, async function (err, res) {
        logger.log('Check exisiting views in _all_docs, processing results:');

        if (err) {

          if (res) {
            if (!res['rows']) err = res.json;
          }

          logger.log(err);
          reject(new Error("Failed to check views"));
          return;
        }




        //console.log(typeof res);
        var r = {};
        var revision;
        try {
          res.rows.forEach(function (row, key) {
            logger.log('Design doc id: ' + row.id + ', rev: ' + row.value.rev);
            if (row.id === '_design/test' || row.id === '_design/test2') {
              var views = Object.getOwnPropertyNames(row.doc.views);
              views_def.view_definitions.forEach(function (value) {
                if (views.find(x => x == value.name)) {
                  mask = mask | value.flag;
                  logger.log("'" + value.name + "' function, adjusted mask:" + parseInt(mask).toString(2));
                }
              });
              revision = row.value.rev;
            }

          });

          var p = undefined;
          if (mask != FULL_MASK) {
            logger.log('Masks aren\'t equal: ' + parseInt(mask).toString(2) + " vs. " + parseInt(FULL_MASK).toString(2));
            p = { revision: revision, mask: mask };
          }
          resolve(p);

        } catch (err) {
          logger.log(err.stack);
          reject(err);
        }

      });
    }); /// Promise ending
  };

  create_view(logger, options) {

    if (typeof options === 'undefined')
      throw new Error('Options are undefined. Can\'t execute views creation without options {revision: doc.revision, mask: <views bit masks>}');

    var mask = options.mask;
    var revision = options.revision;
    this.checkDB();
    var db = this.db;

    return new Promise(resolve => {

      var func = {};
      var view = [];

      views_def.view_definitions.forEach(function (value) {

        // Check mask against views predefined bitmask and include its function if missing
        if (mask & value.flag) {
          logger.log("View already exists: " + value.name);
        } else {
          logger.log("Missing view " + value.name);
        }
        Object.assign(func, value.function);

      });

      logger.log("Creating new view");
      var rev = (revision) ? revision : null;

      //TODO add views into custom defined view names (use save_async for that)
      db.save("_design/test", rev, func, function (err, res) {
        //db.save('_design/test', func , function (err, res) {
        if (err) {
          logger.log(err);
          resolve(err);
          return;
        }
        //console.log("Created succesfully");
        resolve("Created succesfully, id:" + res.id + ", rev: " + res.rev + ", view:" + view); // returning Promise after views are created;
      });





    });//Promise ending
  };

  save_async(dbname, view, rev, func) {

    var db = this.getDBConnection(dbname);
    var logger = new Logger(null);

    return new Promise((resolve, reject) => {

      db.save(view, rev, func, function (err, res) {
        //db.save('_design/test', func , function (err, res) {
        if (err) {
          logger.log(err);
          resolve(err);
          return;
        }
        //console.log("Created succesfully");
        resolve("Created succesfully, id:" + res.id + ", rev: " + res.rev + ", view:" + view); // returning Promise after views are created;
      });

    })

  }

  // query to get data from CouchDB
  // where opts is an object like {key: ['Interaction Server','8.5.107.22']}
  // return promise to use in async/await operations

  select(view, opts, response) {

    var logger = new Logger(response);
    return new Promise(async (resolve, reject) => {
      this.checkDB();
      var db = this.db;
      logger.log('Getting data from ' + db.name + " / " + view + ' with options')
      logger.log(opts);
      try {
        var error;
        var result;
        db.view(view, opts, function (err, res) {
          if (err) {
            logger.log(err);
            reject(err)
          } else {

            logger.log("Found " + res.rows.length + " records");


            resolve(res);
          }
        });
      } catch (err) {
        throw err;
      }
    });
  };

  get(doc_id, response) {
    var logger = new Logger(response);

    return new Promise(async (resolve, reject) => {
      this.checkDB();
      var db = this.db;

      logger.log('Getting data with id ' + doc_id)
      //logger.log(opts);
      try {
        var error;
        var result;
        db.get(doc_id, function (err, res) {
          if (err) {
            logger.log(err);
            reject(err)
          } else {

            logger.log("Record found");


            resolve(res);
          }
        });
      } catch (err) {
        throw err;
      }
    });
  }

  //var logger = null;

  initialize(recreate, response) {
    var logger = new Logger(response);
    return new Promise(async (resolve, reject) => {
      try {
        this.checkDB();
        if (recreate === 'true') this.FULL_MASK = 0x15;
        var p = await this.check_views(logger);
        if (p) await this.create_view(logger, p);
        logger.log(p);

        resolve();
        //response.end();
      } catch (e) {
        logger.log(e.stack);
        reject(e);
        //throw e;
      }
    });
  };



  checkDB() {
    if (this.db === null) throw new Error("Connection to DB is not opened. Please call getDBConnection(database)");
  }

  getDBConnection(database) {
    this.database_name = (typeof database === 'undefined') ? this.database_name : database;
    this.db = new (cradle.Connection)({ auth: { username: this.username, password: this.password } }).database(this.database_name);
    return this.db;
  };

  databases(cb) {
    return new (cradle.Connection)({ auth: { username: this.username, password: this.password } }).databases(cb);
  }

  info(cb) {
    var res = this.db.database(this.database_name).info();

    return res;
  }


  // function to add documents into db with dbname
  // if db doesn't exist it will try to create one
  // as result it should return rev_id of created document

  async save(dbname, result, response) {
    //check if database uahelper exists
    var db = this.getDBConnection(dbname);

    var logger = new Logger(response);

    try {
      await new Promise((resolve, reject) => {
        db.exists(function (err, exists) {
          if (err) {
            logger.log('error', err);
            reject(err);
            return;
          }

          if (exists) {
            logger.log('DB exists, continue: ' + dbname);
            resolve();
          } else {

            db.create(function (err) {
              if (err) {
                logger.log(err);
                reject("Failed to create " + db.name);
                return;
              }
              logger.log('DB did not exist, created: ' + dbname);
              resolve();
            });



          }
        });
      });


      return new Promise((resolve, reject) => {
        db.save(result, function (err, res) {
          if (err) {
            logger.log('error', err);
            reject(err);
          } else {

            logger.log("Saved results to " + db.name + ", res: " + res);
            resolve(res);
          }
        })
      })
    } catch (exc) {
      throw exc;
    }

  }
}





module.exports = {
  CouchDB,
  couchdb_host: '192.168.14.91',
  couchdb_port: 5984,
  couchdb_username: 'admin',
  couchdb_pass: 'Genesys#1',
  couchdb_name: 'genesys_releases'
};