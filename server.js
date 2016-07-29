const express = require('express');
const cluster = require('cluster');
const os = require('os');
const rootRouter = require('./routes');

class Server {

  constructor() {
    this.app = express();
    this.app.use('/', rootRouter);
  }

  startServer(port, callback = defaultListenCallback(port)) {
    return this.app.listen(port, getHostname(), callback);
  }

}

/**
 * defaultListenCallback - Default error handler for express app.listen()
 * @param  {Number} port - The port that a server is listening to.
 * @return {Function}    - call back function for app.listen()
 */
function defaultListenCallback(port) {
  return error => {
    if (error) {
      console.error(`Error while trying to start the server\n${error}`);
    } else {
      console.log(`Server is runnig on port ${port}@${getHostname()}`);
    }
  };
}

/**
 * getHostname - Hostname for expressApp#listen
 * @return {String} - IPv4 address
 */
function getHostname() {
  let interfaces = os.networkInterfaces();
  for (let key of Object.keys(interfaces)) {
    for (let ip of interfaces[key]) {
      if (ip.family === 'IPv4' && ip.internal === false)
        return ip.address;
    }
  }
}

if (cluster.isMaster) {
  new Server().startServer(8080);
} else {
  module.exports = Server;
}
