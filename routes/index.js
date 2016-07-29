const express = require('express');
const api = require('./api');
const redis = require('../helper/redis_client');
const Group = require('../models/group');
const nodemcuNotifier = require('../helper/nodemcu_notifier');

const root = express.Router();
root.use('/api', api);

root.get('/group/:group_name', (req, res, next) => {
  let groupName = req.params.group_name;

  if (groupName === 'groups' || groupName === 'group-node')
    return res.send(`'${groupName}' has been used.`);

  redis.sadd('groups', groupName, (err, reply) => {
    if (err) {
      console.error(`/group/${groupName}\n${err}`);
      return res.status(400).send('Please call staff');
    }
    if (reply <= 0) {
      return res.send(`'${groupName}' has been used.`);
    }
    return res.send(`'${groupName}' is available and has been registered for you.`);
  });
});

root.get('/:group/register', (req, res, next) => {
  let groupName = req.params.group;
  Group.find(groupName, (err, group) => {
    if (err) {
      console.error(`/${groupName}/register\n${err}`);
      return res.status(400).send('Please call staff');
    }

    if (group) {
      return redis.hmset('group-node', groupName, req.ip, err => {
        if (err) {
          console.err(err);
          return res.send('Failed');
        }
        return res.send('Success');
      });
    }
    return res.send('Failed');
  });
});

root.get('/:group/:key', (req, res, next) => {
  let groupName = req.params.group;
  let key = req.params.key;
  Group.find(groupName, (err, group) => {
    if (err) {
      console.error(`/${groupName}/${key}\n${err}`);
      return res.status(400).send('Please call staff');
    }

    res.send(group.getValue(key));
  });
});

root.get('/:group/:key/:value', (req, res, next) => {
  let groupName = req.params.group;
  let key = req.params.key;
  let value = req.params.value;
  Group.find(groupName, (err, group) => {
    if (err) {
      console.error(`/${groupName}/${key}/${value}\n${err}`);
      return res.status(400).send('Please call staff');
    }

    group.setValue(key, value, (err, reply) => {
      if (err) {
        console.error(`/${groupName}/${key}/${value}\n${err}`);
        return res.status(400).send('Failed');
      }

      res.send('Success');
      if (group.nodeIP) {
        nodemcuNotifier.notify(nodemcuNotifier.buildURL(group.nodeIP), (err, res) => {
          console.error(err);
          console.log(res);
        });
      }
    });
  });
});

module.exports = root;
