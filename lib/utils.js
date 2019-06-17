var copy = function (obj, struct) {
    //logger.info(typeof obj);

    const propNames = Object.getOwnPropertyNames(struct);
    propNames.forEach(function (name) {
        const desc = Object.getOwnPropertyDescriptor(struct, name);
        Object.defineProperty(obj, name, desc);
    });
    return obj;
}


/// json to html

var json2html = require('node-json2html');
     
//template
var t = {'<>':'div','html':'<p><b>Last execution time</b>: ${last_execution_time}</span></p><p><b>Duration:</b> ${execution_duration}</p>'};

var toHtml=function(d){   
    return json2html.transform(d,t);
}



module.exports={
    copy: copy,
    toHtml: toHtml
}