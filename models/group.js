const redis = require('../helper/redis_client');
const cache = require('./cache');

class Group {

  constructor(groupName, groupHash = {}, nodeIP = '') {
    this.name = groupName;
    this.hash = groupHash;
    this.nodeIP = nodeIP;
  }

  static find(groupName, callback) {
    let cached = cache.getGroup(groupName);
    if (cached) return callback(null, cached);

    redis.sismember('groups', groupName, (err, isMember) => {
      if (err || !isMember) {
        return callback(err, undefined);
      }

      redis.hgetall(groupName, (err, hash) => {
        if (err) return callback(err);

        redis.hget('group-node', groupName, (err, ip) => {
          if (err) return callback(err);
          let newGroup = new Group(
            groupName,
            hash || undefined,
            ip || undefined);
          cache.cacheGroup(newGroup);
          callback(null, newGroup);
        });
      });
    });
  }

  setValue(key, value, callback = () => {}) {
    if (this.hash[key] === value) return callback(null, 'Value is not change.');

    cache.deleteGroup(this.name);
    redis.hmset(this.name, key, value, callback);
  }

  getValue(key) {
    return this.hash[key];
  }

}

module.exports = Group;
