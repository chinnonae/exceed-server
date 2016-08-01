const express = require('express');
const cluster = require('cluster');
const os = require('os');
const rootRouter = require('./routes');

class Server {

  constructor() {
    this.app = express();

    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
    this.app.use('/', (req, res, next) => {
      console.log(req.url);
      next();
    });
    this.app.use('/', rootRouter);
  }

  startServer(port, callback = defaultListenCallback(port)) {
    return this.app.listen(port, callback);
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
      console.log(`Server is runnig on port ${port}`);
    }
  };
}

if (cluster.isMaster) {
  new Server().startServer(8080);
} else {
  module.exports = Server;
}
