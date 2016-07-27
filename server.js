const express = require('express');
const cluster = require('cluster');

class Server {

  constructor() {
    this.app = express();
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
