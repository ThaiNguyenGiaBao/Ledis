import Entry from "../Entry.mjs";
import { ledis } from "../Ledis.mjs";
import Response from "../Response.mjs";

/**
 * @class String
 * @classdesc Implements the `STRING` commands for the Ledis CLI (set/get operations).
 */

class String {
  /**
   * Set a string value for a given key.
   *
   * @static
   * @param {string} key - The key under which to store the value.
   * @param {string} value - The string value to store.
   * @returns {import('./src/Response').Response} A Response object with status "OK".
   */

  static set(key, value) {
    console.log("set key: ", key, " value: ", value);

    const entry = new Entry(value, null, "string");
    console.log("entry: ", entry);

    ledis.setEntry(key, entry);

    return Response.ok();
  }
  
  /**
   * Get the string value associated with a key.
   *
   * @static
   * @param {string} key - The key to look up.
   * @returns {import('./src/Response').Response} A Response object containing the string value,
   * or a nil Response if the key does not exist or is not a string.
   */
  static get(key) {
    console.log("get key: ", key);
    const entry = ledis.getEntry(key, "string");
    console.log("entry: ", entry);

    if (entry) {
      return Response.string(entry.value);
    }

    return Response.nil();
  }
}

export default String;
