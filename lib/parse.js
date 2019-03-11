var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var utils = require('../lib/utils');
var logger = require('./logger');
var cacheFabric = require('../lib/cache');


var requestHandler = function (args) {

    if (args) {
        (args.logger) ? logger = args.logger : "";
    }

    var cache = cacheFabric.create();

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

        var v85 = $('body').hasClass('mediawiki');

        logger.info('format: '+((v85)?'8.5':'8.1')+', looking for `' + parser+'` parser');
        var parserInstance = null;

        switch (parser) {

            case parsers.releaselist:
                (v85) ? parserInstance = parser_85component_releaseslist : parserInstance = parser_81component_releaseslist;
                break;

            case parsers.page:
                if (v85) {
                    if ($("div.header").text() == "Genesys Care/Support") {
                        parserInstance = parser_LFMTpage;

                    } else {
                        parserInstance = parser_85releasepage;
                    }
                } else { parserInstance = parser_81releasepage };
                break;

            case parsers.componentlinks:
                (v85) ? parserInstance = parserComponentLinks : parserInstance = null;
                break;
            default:
                logger.error("Can't find appropriate parser for " + parser);
                return null;

        }
        logger.info('Found parser for `' + parser+'`: '+parserInstance.name);
        return { start: parserInstance };
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
                el["release-link-href"] = release.children().first().attr('href');



                //       }

                // parsing os support table to get date, release type, restrictions and supported OS
                var headers = $('th');
                var row = $('td');


                for (var i = 0; i < headers.length; i++) {
                    var n = headers.eq(i).text().trim().toLowerCase().replace(" ", "_");
                    if (!el[n])
                        el[n] = $(elem).children().eq(i).text().trim()


                }

                /// adding element to resulting array
                releaseLinks.push(el)

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

        /* 12/17/2018 AT: moving it to parser_85component_releaseslist

        for (var i = 0; i < headers.length; i++) {
            var n = headers.eq(i).text().trim().toLowerCase().replace(" ", "_");
            e[n] = row.eq(i).text().trim();

        }

        */
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

        try {
            // parsing releases table to figure if there are new releases or not
            // get release

            // parsing os support table to get date, release type, restrictions and supported OS
            var headers = $(".os-table").find('th');

            var rows = $(".os-table").find('tr');

            [].shift.call(rows);

            rows.each(function (i, elem) {
                //var s = $(elem).children().first().text().trim();

                var releaseanddate = $(elem).children().first().text().trim().split(/\s?\[/);
                //var reltype = releaseanddate.pop().split(/\].../);
                var reltype = releaseanddate.pop().replace(new RegExp(/(])?(\n)?\s+.\s+/), ']').split(/\]/)

                var e = releaseanddate.concat(reltype);


                var isreleaseFound = reg = new RegExp(/\d\.\d\.\d\d\d\.\d\d/g).test(e[0]);

                if (isreleaseFound) {
                    var el = utils.copy({}, component);

                    el.release = e[0].replace("\n", "").trim();

                    el.release_date = (e[1]) ? e[1].trim().replace(new RegExp(/[[\]]/g), "") : "Unknown date";
                    el.release_type = (e[2]) ? e[2].trim() : "Unknown";

                    logger.info(i + " " + el.release + " " + el.release_date + " " + el.release_type);

                    el['release-link-href'] = el['component-href'] + $(elem).children().first().find('a').first().attr('href'); // to enable internal caching to work as it depends on matching with component url



                    // populate OS table
                    for (var i = 0; i < headers.length; i++) {
                        var n = headers.eq(i).text().trim().toLowerCase().replace(" ", "_");
                        el[n] = $(elem).children().eq(i + 1).text().trim();

                    }
                    releaseLinks.push(el)

                }
            });

        } catch (err) {
            logger.error(err.stack);
        }
        return (releaseLinks);

    }

    var parser_81releasepage = function (html, component) {

        var getContent=function(node){
            var arr=[];
            var length = node.length;
            node.each(function(i, elem) {

                //if(i>1 && i<length-2)
                arr[i] = $(this).html();
              });
            return arr//.join("\n");
        }

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

        e.features = getContent(newrel.nextUntil($(bugfixesprefix)));

        // parsing new issues
        e.issues = getContent(newbugs.nextUntil($(endofsection)));



        el = utils.copy(el, e);



        return (el);

    }

    var parserComponentLinks = async function (html, component) {

        var $ = cheerio.load(html);
        var that = this;
        //var el = utils.copy({}, component);

        var componentlinks = [];

        var prepareObject = function (family, solution_name, embed) {
            let _$ = $;

            let el = utils.copy({}, component);
            el.solution_name = solution_name.replace('\n', '');
            el.family = family;
            el.component = _$(embed).text().replace('\n', '');
            el["component-href"] = _$(embed).attr('href');
            componentlinks.push(el);
            logger.debug(JSON.stringify(el));
        }


        var families = $('div#tabber').children('.tabbertab')


        await new Promise((resolve, reject) => {
            var _$ = $;
            families.each((i, val) => {

                let family = _$(val).attr('title').replace('\n', '');
                if (parsedFamilies.arr.indexOf(family) != -1) {
                    let h4 = _$(val).children('div').find('h4');
                    h4.each((ii, h) => {
                        // let e = {}
                        var solution_name = _$(h).text();
                        var embed = _$(h).children().find('a');

                        if (embed.length > 0) { //found embed link
                            prepareObject(family, solution_name, embed);

                        } else {
                            // 1/3/2019. Adding fix to parse T-Servers
                            /*
                            if (_$(h).text() == 'T-Servers/Network T-Servers') {
                                console.log('Bingo');
                            }
                            */

                            _$(h).nextAll('ul').each((o, ul) => {
                                ; // list of components
                                let f = family;
                                let s = solution_name;
                                _$(ul).find('a').each((iii, a) => {
                                    prepareObject(f, s, a);
                                })
                            })
                        }
                    })
                }
            });

            resolve();
        })

        console.log(componentlinks.length);

        return (componentlinks);
    }


    var parser_LFMTpage = function (html, component) {
        var $ = cheerio.load(html);

        var el = utils.copy({}, component);

        // parsing new features

        var start = 'span[id="Version_' + component.release + '"]';
        var featuresprefix = 'span[id="What.27s_New"]';
        var bugfixesprefix = 'a[name="corrections' + component.release + '"]';
        var endofsection = 'hr[class="section-divider"]';
        var newrel = $(featuresprefix);
        var newbugs = $(bugfixesprefix);

        //newrel.nextUntil($('a[name="corrections'+component.release+'"]')).text();

        var e = {};

        e.features = $(start).parent().nextAll('ul').eq(0).text();

        // parsing new issues
        e.issues = $(start).parent().nextAll('ul').eq(1).text();


        e.upgrade_notes = $(start).parent().nextAll('h3').eq(2).nextUntil($('hr[class="item-separator"]')).text();


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


    return {
        run: function (options, parsername) {

            logger.info("HTTP requester started for: " + options.url)

            return new Promise((resolve, reject) => {

                if (!cache.isCached(options.url)) {

                    request(options, function (error, response, html) {

                        if (error) {
                            logger.info("Bad response for: " + options.url);
                            reject(error)
                        } else {
                            logger.info("Responded: " + options.url + ", HTTP Status code: " + response.statusCode);
                            if (!error && response.statusCode == 200) {

                                cache.add(options.url, html);

                                var parsed = parseHTML(html, parsername, options);
                                resolve(parsed);

                            }
                        }

                    })

                } else {

                    var html = cache.get(options.url);
                    logger.info("Found in cache: " + options.url);
                    var parsed = parseHTML(html, parsername, options)
                    resolve(parsed);
                }
            })


        }
    }
}

var parsers = {
    componentlinks: 'componentlinks',
    releaselist: 'releaselist',
    page: 'page'
}

var parsedFamilies = {
    arr: ["9.1", "9.0", "8.5", "8.1", "8.0", "7.6"]
}

module.exports = {
    requestHandler,
    parsers
};