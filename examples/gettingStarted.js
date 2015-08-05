
var PainlessCrawler = require('./../lib/PainlessCrawler');

// First create a new crawler object
// Define a callback for all items
var crawler = new PainlessCrawler(function (error, response, linksFound, $) {
    if (error) {
        console.error(error);
        return;
    }

    console.log('Crawled url: ' + response.request.uri.href);
    console.log('Links Found: ');
    console.log(linksFound);

    // Do things with jquery '$'
    // ...

    // Add all links on page back into the queue
    linksFound.forEach(function(link) {
        crawler.queue(link);
    });
});

// Add a url to the task queue to kick start the crawler
var URL = 'http://techcrunch.com';
crawler.queue(URL);