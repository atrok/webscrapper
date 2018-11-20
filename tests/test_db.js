var {getlinks,findrelease}=require('../db/dbconfig');
var logger=require('../lib/logger');
//var opts={ startkey: [args, ""], endkey: [args, {}], group: true, reduce: true, inclusive_end: true }

var opts={ solution_name: "Billing Data Server", component: "Billing Data Server", family: "9.0", release:"9.0.000.07" };
findrelease(opts).then(res=>
    logger.info(res.length)
).catch(err=>
    logger.error(err))