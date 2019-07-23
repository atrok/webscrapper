var app = require('express')();
var http = require('http').Server(app);
var x=require('../lib/json2html');
const fs = require('fs');
var path = require('path');


app.get('/test_report', function(req,res){

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write('<h1>Testing execution report</h1>');
    var ret;
    fs.readFile(path.join(__dirname,'execution_report.txt'),function(err,data){
        if (err) throw err;
        res.write(x.toHtml(JSON.parse(data)));
        res.end;

    })

})

app.get('/', function(req,res){

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write('<h1>Testing execution report</h1>');

})

http.listen(3131, function () {
    //http.listen(obj.configuration.http_port, function () {
    console.log('Web Scrapper test server is listening on *:' + 3131);
});