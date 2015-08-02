
# Painless Crawler

## Introduction

Working with some of the top Node.js crawlers on GitHub have led to much frustration with regards to getting something which simply works, and I ended up spending many hours playing around and figuring out how they were supposed to work.

As such, I wanted to build a first and foremost painless crawler that *just works* with clear documetation, which allows the user to focus on more important tasks.

In addition, I intend to use this project to expose myself to testing and continuous integration.

## Installation

```bash
# todo
$ npm install --save painless-crawler
```

## Features

- Hyperlinks found are resolved and validated 
- Provided wrappers for server-side jQuery with [Cheerio](https://github.com/cheeriojs/cheerio)
 
## Usage

Even though I encountered many difficulties with [Node-Crawler](https://github.com/sylvinus/node-crawler) I really liked the simple implementation of how the crawler is used, and as much as possible, I tried to follow its usage pattern. 

```javascript
var PainlessCrawler = require('painless-crawler')

var crawler = new PainlessCrawler();

var URL = 'http://techcrunch.com';

// Add a url to the task queue
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
```

## Tests