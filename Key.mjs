import Ledis from "./Ledis.mjs";
import Response from "./Response.mjs";
class Key {
  static keys() {
    const keys = Ledis.getAllKeys();
    if (keys.length === 0) {
      return Response.emptyArray();
    }
    return Response.array(keys);
  }
  static del(key) {
    console.log("del key: ", key);
    if (Ledis.getEntry(key) === undefined) {
      return Response.integer(0);
    }
    Ledis.removeEntry(key);
    return Response.integer(1);
  }
  static expire(key, seconds) {
    console.log("expire key: ", key, " seconds: ", seconds);
    if (Ledis.getEntry(key) === undefined) {
      return Response.integer(0);
    }
    const entry = Ledis.getEntry(key);
    entry.setExpireAt(Date.now() + seconds * 1000);
    return Response.integer(seconds);
  }
  static ttl(key) {
    const entry = Ledis.getEntry(key);
    if (entry === undefined) {
      return Response.integer(0);
    }
    const ttl = entry.getTTL();

    return Response.integer(ttl);
  }
}

export default Key;
