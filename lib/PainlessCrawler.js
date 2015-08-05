/**
 * Painless Crawler
 *
 * Crawler that just works
 */


var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var underscore = require('underscore');
var urlTools = require('./urlTools');



/**
 * @callback TaskCallback
 * @param error
 * @param {Object} response Request() response object
 * @param {Array} linksFound An array of resolved links that were found on the page
 * @param {Cheerio} $ for server-side jQuery
 */

/***
 *
 * @param {Object} [options]
 * @param {TaskCallback} [defaultCallback] If a default callback is not provided, callbacks will have to be provided as a function
 *                          in queue(), or an error will be thrown
 * @constructor
 */
function PainlessCrawler(options, defaultCallback) {

    // todo allow options to override queue()

    // default options
    this.options = {
        //sameDomain: true,
        // skipDuplicates: true,
        // retries
        maxConnections: 10
    };

    // if arguments are provided
    if (arguments.length > 0) {
        if (underscore.isFunction(options)) {
            this.defaultCallback = options;
        } else if (underscore.isObject(options)) {
            // copy input options to default options
            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    this.options[key] = options[key];
                }
            }
        } else {
            throw 'Invalid argument: ' + options;
        }

        if (defaultCallback) {
            if (underscore.isFunction(defaultCallback)) {
                this.defaultCallback = defaultCallback;
            } else {
                throw 'Invalid default callback argument'
            }
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

        self.taskQueue = async.queue(
            /**
             * Function that will be executed for each task
             * @param {string} url Will be validated
             * @param {TaskCallback} callback
             */
            function (url, callback) {

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

                    // make the array unique
                    linksFound = underscore.uniq(linksFound);

                    if (!error) {
                        self.visited.push(url);
                    }

                    callback(error, response, linksFound, $);
                });

            },
            self.options.maxConnections
        );


    },

    /**
     * Primary function to queue items
     * Flexible in the types that are provided
     * @param {string | Array | Object} taskConfig
     * @param {string} [taskConfig.url]
     * @param {TaskCallback} [taskConfig.callback]
     * @param {TaskCallback} [callback] If this argument is not provided, the default callback will be used
     */
    queue: function (taskConfig, callback) {
        var self = this;

        // get an array task in the format of [{ url: 'http://google.com', callback: func...}, {},... ]

        var tasks = [];

        // if a callback is provided, we override the default callback set in the constructor
        var callbackOverride = callback || self.defaultCallback;

        // Helper functions to push config of string type and object type to the tasks array
        function pushStringConfig(taskConfig) {
            tasks.push({
                url: taskConfig,
                callback: callbackOverride
            });
        }
        function pushObjectConfig(taskConfig) {
            tasks.push({
                url: taskConfig['url'],
                callback: taskConfig['callback'] || callbackOverride
            });
        }

        // argument is a single string (url only)
        if (underscore.isString(taskConfig)) {
            pushStringConfig(taskConfig);
        }

        // argument is an array
        if (underscore.isArray(taskConfig)) {
            taskConfig.forEach(function (element) {

                if (underscore.isString(element)) {
                    pushStringConfig(taskConfig);
                } else if (underscore.isObject(taskConfig)) {
                    pushObjectConfig(taskConfig);
                }

            });
        }

        // argument is an object
        if (underscore.isObject(taskConfig)) {
            pushObjectConfig(taskConfig);
        }

        tasks.forEach(function (task) {
            // first checks to see if the callback is defined before pushing the task
            // Will be triggered when callback is not defined in queue() and during init PainlessCrawler()
            if (!task.callback) {
                throw 'Callback is not defined';
            }

            self.taskQueue.push(task.url, function (error, response, linksFound, $) {
                // use the callback the user has provided
                task.callback(error, response, linksFound, $);
            });
        });
    }
};

module.exports = PainlessCrawler;

if (require.main === module) {

    // basic example

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