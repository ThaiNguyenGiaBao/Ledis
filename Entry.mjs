class Entry {
  constructor(value, expireAt, type) {
    this.value = value;
    this.expireAt = expireAt;
    this.type = type;
  }

  setExpireAt(expireAt) {
    this.expireAt = expireAt;
  }
  isExpired() {
    if (this.getTTL() == -2) {
      return true;
    }
    return false;
  }

  getTTL() {
    if (this.expireAt === null) {
      return -1;
    }
    // retuns the time left in seconds, this.expireAt has Date type
    const now = new Date();
    const diff = this.expireAt - now;
    if (diff < 0) {
      return -2;
    }
    return Math.floor(diff / 1000);
  }
}

export default Entry;
