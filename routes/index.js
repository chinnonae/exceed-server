const express = require('express');
const net = require('net');

const api = require('./api');
const redis = require('../helper/redis_client');
const Group = require('../models/group');
const nodemcuNotifier = require('../helper/nodemcu_notifier');

const root = express.Router();
root.use('/api', api);

root.get('/group/:group_name', (req, res, next) => {
  let groupName = req.params.group_name;

  if (groupName === 'groups')
    return res.send(`'${groupName}' has been used.`);

  redis.sadd('groups', groupName, (err, reply) => {
    if (err) {
      console.error(`/group/${groupName}\n${err}`);
      return res.status(500).send('Please call staff');
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
      return res.status(500).send('Please call staff');
    }

    if (group) {
      return group.setValue('node-ip', toIPv4(req.ip), (err, replies) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Please call staff');
        }
        return res.send('Success');
      });
    }
    return res.send('Failed');
  });
});

root.get('/:group', (req, res, next) => {
  let groupName = req.params.group;
  Group.find(groupName, (err, group) => {
    if (err) {
      console.error(`/${groupName}\n${err}`);
      return res.status(500).send('Please call staff');
    }

    if (!group) {
      return res.send("Group is not exist, /group/'group name' to create one.");
    }

    return res.send(group.getValue('value'));
  });
});

root.get('/:group/:value', (req, res, next) => {
  let groupName = req.params.group;
  let value = req.params.value;
  Group.find(groupName, (err, group) => {
    if (err) {
      console.error(`/${groupName}/${value}\n${err}`);
      return res.status(500).send('Please call staff');
    }

    if (group) {
      if (toIPv4(req.ip) === group.nodeIP) {
        group.setValue('value', value, (err, reply) => {
          if (err) {
            console.error(`/${groupName}/${value}\n${err}`);
            return res.status(500).send('Failed');
          }
        });
        return res.send('Success');
      } else if (group.nodeIP && group.nodeIP !== toIPv4(req.ip)) {
        console.log(group.nodeIP);
        nodemcuNotifier.notify(nodemcuNotifier.buildURL(group.nodeIP, value), err => {
          if (err) {
            console.error(err);
            return res.send('Failed to notify nodeMCU.');
          }
          return res.send('Successfully notify nodeMCU.');
        });
      } else {
        return res.send('Failed. NodeMCU is not registered.');
      }
    }
  });
});

/**
 * IPv4 - Parse IPv6 to IPv4
 * @param  {String} ip - IP in String
 * @return {Stirng} - IPv4 if @param[ip] can be parse to IPv4.
 */
function toIPv4(ip) {
  if (!net.isIP(ip)) return undefined;
  if (net.isIPv4(ip)) return ip;

  let ipv4 = ip.split(':').reverse()[0];
  if (!net.isIPv4(ipv4)) {
    return undefined;
  }
  return ipv4;
}

module.exports = root;
