var {getlinks,findrelease}=require('../db/dbconfig');

//var opts={ startkey: [args, ""], endkey: [args, {}], group: true, reduce: true, inclusive_end: true }

var opts=[ "Billing Data Server", "Billing Data Server", "9.0", "9.0.000.07" ];
findrelease(opts).then(res=>console.log(res.length)).catch(err=>console.log(err))