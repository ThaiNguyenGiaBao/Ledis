import Entry from "./Entry.mjs";
import { ledis } from "./Ledis.mjs";

import Response from "./Response.mjs";

class Set {
  static sadd(key, ...valueList) {
    console.log("sadd key: ", key, " valueList: ", valueList);
    if (key === undefined || valueList.length === 0) {
      return Response.error("Key and value are required");
    }
    if (ledis.getEntry(key) === undefined) {
      // remove all duplicates from the set
      let list = [];
      for (const value of valueList) {
        if (!list.includes(value)) {
          list.push(value);
        }
      }

      const entry = new Entry(list, null, "set");
      try {
        ledis.setEntry(key, entry);
      } catch (error) {
        return Response.error(error.message);
      }
      return Response.integer(list.length);
    } else {
      const existingEntry = ledis.getEntry(key);
      if (existingEntry.type !== "set") {
        return Response.error(`Error: Type mismatch for key '${key}'`);
      }
      let count = 0;
      for (const value of valueList) {
        if (!existingEntry.value.includes(value)) {
          existingEntry.value.push(value);
          count++;
        }
      }
      ledis.setEntry(key, existingEntry);

      return Response.integer(count);
    }
  }

  static smembers(key, check) {
    if (check !== undefined) {
      return Response.error("Invalid number of arguments");
    }
    if (key === undefined) {
      return Response.error("Key is required");
    }
    const entry = ledis.getEntry(key);
    if (entry === undefined) {
      return Response.emptyArray();
    }
    return Response.array(entry.value);
  }

  static srem(key, ...valueList) {
    console.log("srem key: ", key, " valueList: ", valueList);
    if (key === undefined || valueList.length === 0) {
      return Response.error("Key and value are required");
    }
    const existingEntry = ledis.getEntry(key);
    if (existingEntry === undefined) {
      return Response.emptyArray();
    }

    let count = 0;
    for (const value of valueList) {
      const index = existingEntry.value.indexOf(value);
      if (index !== -1) {
        existingEntry.value.splice(index, 1);
        count++;
      }
    }
    if (existingEntry.value.length === 0) {
      ledis.removeEntry(key);
    }
    return Response.integer(count);
  }

  static sinter(...listKey) {
    if (listKey.length === 0) {
      return Response.error("Key is required");
    }
    console.log("sinter listKey: ", listKey);
    let minIdx = 0;
    let minLen = Number.MAX_VALUE;
    const valueList = listKey.map((key, index) => {
      const entry = ledis.getEntry(key);
      if (entry === undefined) {
        return Response.emptyArray();
      }
      if (entry.value.length < minLen) {
        minLen = entry.value.length;
        minIdx = index;
      }
      return entry.value;
    });

    console.log(valueList);
    const minSet = valueList[minIdx];
    const result = minSet.filter((value) => {
      let check = true;
      for (const set of valueList) {
        if (!set.includes(value)) {
          check = false;
          break;
        }
      }
      return check;
    });
    console.log("result: ", result);
    if (result.length === 0) {
      return Response.emptyArray();
    }
    return Response.array(result);
  }
}

export default Set;
