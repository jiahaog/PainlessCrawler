
# Painless Crawler

![Build Status](https://travis-ci.org/skewedlines/PainlessCrawler.svg)

[![NPM](https://nodei.co/npm/painless-crawler.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/painless-crawler/)

## Introduction
Working with some of the top Node.js crawlers on GitHub have led to much frustration with regards to getting something which simply works, and I ended up spending many hours playing around and figuring out how they were supposed to work.

As such, I wanted to build a first and foremost painless crawler that *just works* with clear documetation, which allows the user to focus on more important tasks.

In addition, I intend to use this project to expose myself to testing and continuous integration.

## Installation

```bash
$ npm install --save painless-crawler
```

## Features
- Hyperlinks found are resolved and validated 
- Provided wrappers for server-side jQuery
 
## Getting Started
Even though I encountered many difficulties with [Node-Crawler](https://github.com/sylvinus/node-crawler) I really liked the simple implementation of how the crawler is used, and as much as possible, I tried to follow its usage pattern. 

A crawler object is essentially a task queue of urls that will be continuously acted on. The example below will visit the homepage of TechCrunch, find and resolve all links on the page, and add all the urls found back into the task queue.

```javascript
var PainlessCrawler = require('painless-crawler')

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
```

## Task Callback

The callback for crawling is in the form below with the corresponding arguments 

```javascript
var callback = function (error, response, linksFound, $) {
	if (error) {
		console.error(error);
		return;
	}
	
	// ...
}
```



**`error`String**


**`response` Object **

Response for the http request made, an instance of [http.IncomingMessage](https://nodejs.org/api/http.html#http_http_incomingmessage)

**`linksFound` Array **

An array of hyperlinks that are found on the page. All links found will be validated, stripped of any fragment identifiers,  and relative links will be resolved to absolute ones.

**`$`**

A [Cheerio](https://github.com/cheeriojs/cheerio) object that represents the document and contains jQuery-esque functions

### Hierarchy

Callbacks can be defined on different levels, and the crawler will search up the hierarchy to find a valid callback in the order stated below.

1. Task Configuration
2. Parameter in `crawler.queue()`
3. Constructor

If no callback is defined, an error will be thrown.

## Usage


### Constructor

`new PainlessCrawler([[options, ] callback])`

- `options` Object
	- `maxConnections` Number default = 10
	- Any other arguments [accepted by Request](https://github.com/request/request#requestoptions-callback)
- `callback` function


Example:
```javascript

var options = {
	maxConnections: 25;
}

var crawler = new PainlessCrawler(options, callback)
```

### Queue

`painlessCrawler.queue(task[, callback])`

- `task` String | Object | Array
- `callback` Function


#### `task` String
```javascript
crawler.queue('http://www.google.com', callback);
```

#### `task` Object
Task configurations can also be passed into the queue as an object. A task configuration is an object that contains a `url` and a `callback` for the task.

- `task.url` String
- `task.callback` function (optional)

```javascript
var task0 = {
	url: 'http://www.google.com',
	callback: function (error, response, linksFound, $) {
		if (error) {
			console.error(error);
			return;
		}
		
		// ...
	}
}
crawler.queue(task0);
```

Note that if a task configuration is provided with a valid callback, it will take precedence over the callback provided as the second parameter of queue. 

```javascript
// myCallback will be ignored
crawler.queue(task0, myCallback);
```

#### `task` Array

An array of `task` objects can be passed into the queue as well.

If a valid callback is provided in each task object, that callback will be executed, else the crawler will go up the callback hierarchy to find a callback.

```javascript
var taskConfigs = [task0, task1, task2];
crawler.queue(taskConfigs);
```

## Tests

Run tests: 
```bash
$ npm test
```

Testing in [Docker](https://www.docker.com) is also supported
```bash
$ docker build -t painless-crawler-test ./test
$ docker run painless-crawler-test
```
