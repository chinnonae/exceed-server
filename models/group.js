const redis = require('../helper/redis_client');
const cache = require('./cache');

class Group {

  constructor(groupName, groupHash = {}) {
    this.name = groupName;
    this.hash = groupHash;
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

        let newGroup = new Group(groupName, hash || undefined);
        cache.cacheGroup(newGroup);
        callback(null, newGroup);
        cache.deleteGroup(groupName);
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

  get nodeIP() {
    return this.hash['node-ip'];
  }

}

module.exports = Group;
