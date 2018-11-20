var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var utils=require('../lib/utils');
var logger = require('./logger');
var cache=require('../lib/cache').create();


var requester = function (options, parsername) {

    logger.info("HTTP requester started")

    return new Promise((resolve, reject) => {

        if (!cache.isCached(options.url)) {
            request(options, function (error, response, html) {

                logger.info("Requested: " + options.url);
                if (!error && response.statusCode == 200) {

                    cache.add(options.url,html);

                    resolve(parseHTML(html, parsername,options));

                } else {
                    reject(error)
                }

            })

        } else {

            var html=cache.get(options.url);
            logger.info("Found in cache: " + options.url);
            resolve(parseHTML(html, parsername, options));
        }
    })


}


var parseHTML = function (html, parsername, options) {
    logger.info("parseHTML initiated");

    var component = options.search;

    var parser = parserFactory(html, parsername);
    if (parser == null) {
        throw (new Error("Failed to initialize parser: " + parsername));
    } else {
        var parsed = parser.start(html, component);
        return parsed;
    }
}
var parserFactory = function (html, parser) {

    var $ = cheerio.load(html);

    if ($('body').hasClass('mediawiki')) {

        logger.info('format: 8.5, parser:' + parser);
        switch (parser) {

            case parsers.releaselist:
                return { start: parser_85component_releaseslist };

            case parsers.page:
                return { start: parser_85releasepage }

            default:
                return null;

        }


    } else {

        logger.info('format: 8.1, parser:' + parser);
        switch (parser) {

            case "releaselist":
                return { start: parser_81component_releaseslist };

            case "page":
                return { start: parser_81releasepage }

            default:
                return null;
        }

    }
    return null;
}


var parsers = {
    releaselist: 'releaselist',
    page: 'page'
}





var parser_85component_releaseslist = function (html, component) {
    var $ = cheerio.load(html);

    logger.info('parser_85component_releaseslist');
    var releaseLinks = [];

    // parsing releases table to figure if there are new releases or not
    // get release


    $('tr').each(function (i, elem) {
        var el = utils.copy({}, component);
        var release = $(elem).children().first();

        var isreleaseFound = reg = new RegExp(/\d\.\d\.\d\d\d\.\d\d/g).test(release);

        if (isreleaseFound) {

            el.release = release.text().trim();
            el.release_date = $(elem).children().eq(1).text().replace("\n", "");
            el.release_type = $(elem).children().eq(2).text().replace("\n", "");


            logger.info(i + " " + el.release);

            //        if (el.release !== 'Release') {
            el["release-link-href"] = release.children().first().attr('href')
            releaseLinks.push(el)
            //       }

            // parsing os support table to get date, release type, restrictions and supported OS


        }
    });
    return (releaseLinks);
}

var parser_85releasepage = function (html, component) {
    var $ = cheerio.load(html);

    var el = utils.copy({}, component);


    // parsing os support table to get date, release type, restrictions and supported OS
    var headers = $('th');
    var row = $('td');

    var e = {}
    for (var i = 0; i < headers.length; i++) {
        var n = headers.eq(i).text().trim().toLowerCase().replace(" ", "_");
        e[n] = row.eq(i).text().trim();

    }

    // parsing new features

    e.features = $("#Resolved_Issues").parent().prevAll('ul').text();

    // parsing new issues
    e.bugfixes = $("#Resolved_Issues").parent().nextUntil('h2').text();



    el = utils.copy(el, e);

    return (el);

}

var parser_81component_releaseslist = function (html, component) {

    var $ = cheerio.load(html);

    //logger.info($);
    var releaseLinks = [];

    // parsing releases table to figure if there are new releases or not
    // get release

    // parsing os support table to get date, release type, restrictions and supported OS
    var headers = $(".os-table").find('th');

    var rows = $(".os-table").find('tr');

    [].shift.call(rows);

    rows.each(function (i, elem) {
        //var s = $(elem).children().first().text().trim();

        var releaseanddate = $(elem).children().first().text().trim().split(/\s?\[/);
        var reltype = releaseanddate.pop().split(/\].../);

        var e = releaseanddate.concat(reltype);


        var isreleaseFound = reg = new RegExp(/\d\.\d\.\d\d\d\.\d\d/g).test(e[0]);

        if (isreleaseFound) {
            var el = utils.copy({}, component);

            el.release = e[0].replace("\n", "").trim();

            el.release_date = e[1].trim().replace(new RegExp(/[[\]]/g), "");
            el.release_type = e[2].trim();

            logger.info(i + " " + el.release + " " + el.release_date + " " + el.release_type);

           el['release-link-href']=el['component-href']+ $(elem).children().first().find('a').first().attr('href'); // to enable internal caching to work as it depends on matching with component url



            // populate OS table
            for (var i = 0; i < headers.length; i++) {
                var n = headers.eq(i).text().trim().toLowerCase().replace(" ", "_");
                el[n] = $(elem).children().eq(i + 1).text().trim();

            }
            releaseLinks.push(el)

        }
    });
    return (releaseLinks);

}

var parser_81releasepage = function (html, component) {
    var $ = cheerio.load(html);

    var el = utils.copy({}, component);

    // parsing new features

    var featuresprefix = 'a[name="new' + component.release + '"]';
    var bugfixesprefix = 'a[name="corrections' + component.release + '"]';
    var endofsection = 'hr[class="section-divider"]';
    var newrel = $(featuresprefix);
    var newbugs = $(bugfixesprefix);

    //newrel.nextUntil($('a[name="corrections'+component.release+'"]')).text();

    var e = {};

    e.features = newrel.nextUntil($(bugfixesprefix)).text();

    // parsing new issues
    e.issues = newbugs.nextUntil($(endofsection)).text();



    el = utils.copy(el, e);

    return (el);

}

var copy = function (obj, struct) {
    //logger.info(typeof obj);

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
    parser_85releasepage,
    parser_81releasepage,
    parser_81component_releaseslist,
    parsers
};