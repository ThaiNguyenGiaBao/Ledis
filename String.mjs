import Entry from "./Entry.mjs";
import Ledis from "./Ledis.mjs";
import Response from "./Response.mjs";

class String {
  static set(key, value) {
    //console.log("set key: ", key, " value: ", value);
    const entry = new Entry(value, null, "string");
    console.log("entry: ", entry);
    try {
      Ledis.setEntry(key, entry);
    } catch (error) {
      return Response.error(error.message);
    }
    return Response.string("OK");
  }
  static get(key) {
    const entry = Ledis.getEntry(key);
    console.log("entry: ", entry);
    if (entry) {
      return Response.string(entry.value);
    }

    return Response.nil();
  }
}

export default String;
