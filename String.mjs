import Entry from "./Entry.mjs";
import Ledis from "./Ledis.mjs";
import Response from "./Response.mjs";

class String {
  static set(key, value, check) {
    //console.log("set key: ", key, " value: ", value);
    if (key === undefined || value === undefined) {
      return Response.error("Key and value are required");
    }
    if (check !== undefined) {
      return Response.error("Invalid number of arguments");
    }
    const entry = new Entry(value, null, "string");
    console.log("entry: ", entry);
    try {
      Ledis.setEntry(key, entry);
    } catch (error) {
      return Response.error(error.message);
    }
    return Response.string("OK");
  }
  static get(key, check) {
    if (key === undefined) {
      return Response.error("Key is required");
    }
    if (check !== undefined) {
      return Response.error("Invalid number of arguments");
    }
    //console.log("get key: ", key);
    const entry = Ledis.getEntry(key);
    console.log("entry: ", entry);
    if (entry) {
      return Response.string(entry.value);
    }

    return Response.nil();
  }
}

export default String;
