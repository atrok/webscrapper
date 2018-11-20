var oracledb = require('./libs/oracledbwrapper');
var mssqldb = require('./libs/mssqldbwrapper');
var couchdb=require('./libs/couchdbwrapper')
var Logger=require('./libs/logger');
const { ResultHandlerMsql, ResultHandlerOra } = require('./libs/preparefordocprocessing');

var dbwrapper = function () { 

}

dbwrapper.prototype.getInstance = function (connection_string) {
    this.dbtype = connection_string.dbtype || 'oracle';
    
    switch (this.dbtype) {
        case 'oracle':

            this.db = oracledb.addConfiguration(connection_string);
            this.resultHandler = new ResultHandlerOra();
            this.db.assignlogger(new Logger());
            return this;

        case 'mssql':
            this.db = new mssqldb();
            this.db.addConfiguration(connection_string);

            this.resultHandler = new ResultHandlerMsql();
            this.db.assignlogger(new Logger());
            return this;
        
        case 'couchdb':
            this.db=new couchdb();
            this.db.addConfiguration(connection_string);
            this.db.assignlogger(new Logger());

            //this.resultHandler = new ResultHandlerMsql();
            return this;

        default:
            return null;

    }
}

dbwrapper.prototype.logger = function (logger) {
    this.db.assignlogger(logger);
    return this;
}

dbwrapper.prototype.init = function (socket) {
    db = this.db;
    return new Promise(async (resolve, reject) => {
        try {
            var res = await db.init(socket);

            resolve(res);
        } catch (err) {
            console.log(err.stack)
            reject(err);
        }
    })
}

dbwrapper.prototype.handleRequest=function(param){
    db = this.db;
    return new Promise(async (resolve, reject) => {
        try {
            var res = await db.handleRequest(param);

            //postprocessing
            var postprocessed=(this.resultHandler)?this.resultHandler.prepare(res):res;

            resolve(postprocessed);
        } catch (err) {
            console.log(err.stack)
            var postprocessed=(this.resultHandler)?this.resultHandler.prepare(err):err;
            
            reject(postprocessed);
        }
    })
}

dbwrapper.prototype.releaseResources=function(){
    if(this.db)
        return this.db.releaseResources();
    return null;
}

var couchdb_requests={
    remove:{
        request:"remove",
        params:{
            id: null,
            revid: null,
            dbname: null
        }
    },
    createView:{
        request:"createView",
        params:{
            dbname:null,
            view: null,
            rev: null,
            func: null
        }
    },

    save:{
        request:"save",
        params:{
            result: null,
            dbname : null
        }
    },
    update:{
        request:"update",
        params:{
            result: null,
            id: null,
            revid: null,
            dbname: null
        }
    },
    query:{
        request: "query",
        params:{
            response: null,
            result: null,
            view: null,
            dbname: null,
            opts: null
        }
    },
    get:{
        request:"get",
        params:{
            response: null,
            id: null,
            dbname: null
        }
    },
    init:{
        request:"init",
        params:{
            response: null,
            dbname: null
        }
    },
    info:{
        request:"info",
        params:{
            response: null,
            dbname: null
        }
    },
    isviewexists: {
        request: "isviewexists",
        params:{
            response:null,
            dbname:null,
            view: null
        }
    }
}
module.exports = {dbwrapper:new dbwrapper(), couchdb_requests}