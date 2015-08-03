/**
 * Created by JiaHao on 3/8/15.
 */

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var urlTools = require('./../lib/urlTools');

var urlList = require('./urlList');

var PainlessCrawler = require('./../lib/PainlessCrawler');

describe('Url Tools', function () {

    describe('Url is Valid', function () {
        it('Validates the url', function () {


            var validUrl = require('valid-url');
            urlList.valid.forEach(function (url) {
                assert.equal(urlTools.validate(url), validUrl.isWebUri(url));
            });

            urlList.invalid.forEach(function (url) {
                assert.equal(urlTools.validate(url), validUrl.isWebUri(url));
            })

        })
    });
});


describe('PainlessCrawler', function () {


    it('Links are found from crawl', function (done) {
        var crawler = new PainlessCrawler();

        var URL = 'http://techcrunch.com';

        // Add a url to the task queue
        crawler.queue(URL, function (error, response, linksFound, $) {
            expect(linksFound.length).to.be.at.least(10);
            done(error);

            //if (error) {
            //    console.error(error);
            //    return;
            //}
            //
            //console.log('Crawled url: ' + response.request.uri.href);
            //
            //console.log('Links Found: ');
            //console.log(linksFound);

        });
    });

    it('Can queue multiple urls', function (done) {
        var crawler = new PainlessCrawler();

        var URL = 'http://techcrunch.com';

        // Add a url to the task queue
        crawler.queue(URL, function (error, response, linksFound, $) {
            done(error);

            //if (error) {
            //    console.error(error);
            //    return;
            //}
            //
            //console.log('Crawled url: ' + response.request.uri.href);
            //
            //console.log('Links Found: ');
            //console.log(linksFound);

        });

    })


});