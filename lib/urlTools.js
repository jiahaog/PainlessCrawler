

var validUrl = require('valid-url');
var url = require('url');
var tld = require('tldjs');

/**
 * Helper object for dealing with urls
 * @constructor
 */
function UrlTools() {}

UrlTools.prototype = {
    constructor: UrlTools,

    /**
     * Gets a complete url from a href, by testing to see if its valid
     *
     * To deal with relative links
     * @param currentUrl
     * @param {string | undefined} href
     * @returns {string|null} result | invalid
     */
    resolve: function (currentUrl, href) {

        if (!href) {
            return null;
        }

        // remove fragment identifier from href;
        const FRAGMENT_IDENTIFIER_REGEX = /#.*/;
        href = href.replace(FRAGMENT_IDENTIFIER_REGEX, '');
        currentUrl = currentUrl.replace(FRAGMENT_IDENTIFIER_REGEX, '');

        var isValidUrl = !!validUrl.isWebUri(href);

        if (isValidUrl) {
            return href;
        }

        const REGEX = /(javascript:.*)|(^#.*)/;

        var isHrefToAnotherPage = !REGEX.test(href);

        if (!isHrefToAnotherPage) {
            return null;
        }


        var isPathAbsolute = href.charAt((0)) === '/';


        if (isPathAbsolute) {
            var parsedUrl = url.parse(currentUrl);
            parsedUrl.pathname = null;
            parsedUrl.path = null;
            return parsedUrl.format() + href;

        } else {
            return currentUrl + href;
        }
    },

    /**
     * Validates the url
     * @param url
     * @returns {string | undefined}
     */
    validate: function (url) {
        return validUrl.isWebUri(url);
    },

    /**
     * Checks if the url is from the same domain
     * @param referenceUrl
     * @param inpUrl
     * @returns {boolean}
     */
    sameDomain: function (referenceUrl, inpUrl) {

        var self = this;

        var sameDomain = tld.getDomain(inpUrl) === tld.getDomain(referenceUrl);
        var sameSuffix = tld.getPublicSuffix(inpUrl) === tld.getPublicSuffix(referenceUrl);

        return sameDomain && sameSuffix;
    }

};

module.exports = new UrlTools();