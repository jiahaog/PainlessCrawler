/**
 * Painless Crawler
 *
 * Crawler that just works
 */


var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var urlTools = require('./urlTools');


function PainlessCrawler(options) {

    // todo default callback

    // default options
    this.options = {
        //sameDomain: true,
        // skipDuplicates: true,
        // retries
        maxConnections: 10
    };

    // copy input options to default options
    for (var key in options) {
        if (options.hasOwnProperty(key)) {
            this.options[key] = options[key];
        }
    }

    this.init();

}


PainlessCrawler.prototype = {
    constructor: PainlessCrawler,

    /**
     * Sets up the task queue for the object
     */
    init: function () {
        var self = this;

        self.taskQueue = async.queue(function (url, callback) {

            // defensive
            if (!urlTools.validate(url)) {
                callback('Url: ' + url + ' is invalid');
                return;
            }

            // Copy options because of a new parameter, url as the options will be passed into requet
            var options = JSON.parse(JSON.stringify(self.options));
            options['url'] = url;

            request(options, function (error, response, body) {
                var $ = cheerio.load(body);

                var linksFound = [];
                if ($) {
                    $('a').each(function (index, a) {
                        var foundHref = $(a).attr('href');

                        var toQueueUrl = urlTools.resolve(url, foundHref);

                        if (!toQueueUrl) {
                            return;
                        }

                        linksFound.push(toQueueUrl);

                    });
                }

                callback(error, response, linksFound, $);
            });

        }, self.options.maxConnections);
    },

    /**
     * Primary function to queue items
     * @param {string | Array} inp
     * @param callback
     */
    queue: function (inp, callback) {
        var self = this;
        self.taskQueue.push(inp, callback);
    }
};

if (require.main === module) {

    // testing

    var crawler = new PainlessCrawler();

    var URL = 'http://techcrunch.com';

    crawler.queue(URL, function (error, response, linksFound, $) {
        if (error) {
            console.error(error);
            return;
        }

        console.log('Crawled url: ' + response.request.uri.href);
        console.log('Links Found: ');
        console.log(linksFound);


        // do things with document $

    });
}