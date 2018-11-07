var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');


var requester = function (options, parser) {

    console.log("parser")
    return new Promise((resolve, reject) => {

        request(options, function (error, response, html) {
            var component = options.search;

            console.log("Responded " + options.url);
            if (!error && response.statusCode == 200) {


                var parsed = parser(html, component);
                resolve(parsed);
            } else {
                reject(error)
            }

        })
    })
}

var parser_85component_releaseslist = function (html, component) {
    var $ = cheerio.load(html);

    console.log($);
    var releaseLinks = [];

    // parsing releases table to figure if there are new releases or not
    // get release
    $('tr').each(function (i, elem) {
        var el = copy({}, component);
        var e = $(elem).children().first();
        el.release = e.text().trim();
        console.log(i + " " + el.release);

        if (el.release !== 'Release') {
            el.url = e.children().first().attr('href')
            releaseLinks.push(el)
        }
    });
    return (releaseLinks);
}

var parser_85releasepage = function (html, component) {
    var $ = cheerio.load(html);

    var el = copy({}, component);


    // parsing os support table to get date, release type, restrictions and supported OS
    var headers = $('th');
    var row = $('td');

    var e = {}
    for (var i = 0; i < headers.length; i++) {
        var n = headers.eq(i).text().trim().toLowerCase().replace(" ", "_");
        e[n] = row.eq(i).text().trim();

    }

    // parsing new features

    e.features=$('#mw-content-text ul').html();

    // parsing new issues

    el = copy(el, e);

    return (el);

}

var copy = function (obj, struct) {
    //console.log(typeof obj);

    const propNames = Object.getOwnPropertyNames(struct);
    propNames.forEach(function (name) {
        const desc = Object.getOwnPropertyDescriptor(struct, name);
        Object.defineProperty(obj, name, desc);
    });
    return obj;
}

module.exports = {
    requester,
    parser_85component_releaseslist,
    parser_85releasepage
};