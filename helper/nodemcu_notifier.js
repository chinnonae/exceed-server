const http = require('http');

/**
 * buildURL - url builder for sending notification to nodemcu.
 * @param  {String} ip - IP address of nodemcu.
 * @param  {String} value - changed data.
 * @return {String} - URL for sending a request.
 */
function buildURL(ip, value) {
  return `http://${ip}/${value}`;
}

/**
 * notify - notify change to nodemcu by sending http GET request to a server on nodemcu.
 * @param  {String} url - url for sending notification [expected to be a url from buildURL()]
 * @param  {Function} callback - a callback with 2 argument (err, res)
 */
function notify(url, callback) {
  http.get(url, res => {
    callback(null, res);
  }).on('error', e => {
    callback(e);
  });
}

module.exports = {
  buildURL,
  notify
};
