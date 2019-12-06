var {deletefromdb}=require('../db/dbconfig');
var logger=require('../lib/logger');
//var opts={ startkey: [args, ""], endkey: [args, {}], group: true, reduce: true, inclusive_end: true }

var opts={ test:false };
deletefromdb(opts).then(res=>
    logger.info(res.length)
).catch(err=>
    logger.error(err))