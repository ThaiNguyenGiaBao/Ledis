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
  static del(key, check) {
    console.log("del key: ", key);
    if (check !== undefined) {
      return Response.error("Invalid number of arguments");
    }
    if (key === undefined) {
      return Response.error("Key is required");
    }
    if (Ledis.getEntry(key) === undefined) {
      return Response.integer(0);
    }
    Ledis.removeEntry(key);
    return Response.integer(1);
  }
  static expire(key, seconds, check) {
    console.log("expire key: ", key, " seconds: ", seconds);
    if (key === undefined || seconds === undefined) {
      return Response.error("Key and seconds are required");
    }
    if (check !== undefined) {
      return Response.error("Invalid number of arguments");
    }
    if (isNaN(seconds)) {
      return Response.error("Seconds must be a number");
    }
    if (Ledis.getEntry(key) === undefined) {
      return Response.integer(0);
    }
    const entry = Ledis.getEntry(key);
    entry.setExpireAt(Date.now() + seconds * 1000);
    return Response.integer(seconds);
  }
  static ttl(key, check) {
    console.log("ttl key: ", key);
    if (key === undefined) {
      return Response.error("Key is required");
    }
    if (check !== undefined) {
      return Response.error("Invalid number of arguments");
    }
    const entry = Ledis.getEntry(key);
    if (entry === undefined) {
      return Response.integer(-2);
    }
    const ttl = entry.getTTL();

    return Response.integer(ttl);
  }
}

export default Key;
