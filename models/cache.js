const Cache = {
  groups: {},

  cacheGroup(group) {
    this.groups[group.name] = group;
    return this.groups[group.name];
  },

  getGroup(groupName) {
    return this.groups[groupName];
  },

  deleteGroup(groupName) {
    if (this.groups[groupName]) {
      delete this.groups[groupName];
      return true;
    }
    return false;
  },

  clearGroups() {
    if (Object.keys(this.groups).length === 0) {
      return false;
    }
    this.groups = {};
    return true;
  }

};

module.exports = Cache;
