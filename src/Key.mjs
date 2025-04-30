import { ledis } from "./Ledis.mjs";
import Response from "./Response.mjs";
class Key {
  static keys() {
    const keys = ledis.getAllKeys();
    if (keys.length === 0) {
      return Response.emptyArray();
    }
    return Response.array(keys);
  }
  static del(key) {
    console.log("del key: ", key);
    
    if (ledis.getEntry(key) === undefined) {
      return Response.integer(0);
    }
    ledis.removeEntry(key);
    return Response.integer(1);
  }
  static expire(key, seconds) {
    console.log("expire key: ", key, " seconds: ", seconds);
  

    if (isNaN(seconds)) {
      return Response.error("Seconds must be a number");
    }
    if (ledis.getEntry(key) === undefined) {
      return Response.integer(0);
    }
    const entry = ledis.getEntry(key);
    entry.setExpireAt(Date.now() + seconds * 1000);
    return Response.integer(seconds);
  }
  static ttl(key) {
    console.log("ttl key: ", key);
    
    const entry = ledis.getEntry(key);
  
    if (entry === undefined) {
      return Response.integer(-2);
    }
    const ttl = entry.getTTL();

    return Response.integer(ttl);
  }
}

export default Key;
