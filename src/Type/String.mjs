import Entry from "../Entry.mjs";
import { ledis } from "../Ledis.mjs";
import Response from "../Response.mjs";

class String {
  static set(key, value) {
    console.log("set key: ", key, " value: ", value);

    const entry = new Entry(value, null, "string");
    console.log("entry: ", entry);

    ledis.setEntry(key, entry);

    return Response.string("OK");
  }
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
