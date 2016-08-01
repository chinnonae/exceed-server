const cluster = require('cluster');
const Server = require('./server.js');
const os = require('os');

const spawnWorker = process.argv[2] == 'true';

if (cluster.isMaster && spawnWorker) {
  let numCore = os.cpus().length;
  for (let i = 0; i < numCore; i++) {
    cluster.fork();
  }
} else {
  new Server().startServer(8080);
}
