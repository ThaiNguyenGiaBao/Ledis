import Entry from "../Entry.mjs";
import { ledis } from "../Ledis.mjs";

import Response from "../Response.mjs";

class LSet {
  static sadd(key, ...valueList) {
    //console.log("sadd key: ", key, " valueList: ", valueList);

    const entry = ledis.getEntry(key, "set");

    if (entry === undefined) {
      // remove all duplicates from the set
      const set = new Set(valueList);

      const entry = new Entry(set, null, "set");

      ledis.setEntry(key, entry);

      return Response.integer(set.size);
    } else {
      const existingEntry = ledis.getEntry(key, "set");
      const set = existingEntry.value;
      const beforeSize = existingEntry.value.size;

      valueList.forEach((value) => {
        set.add(value);
      });
      const afterSize = existingEntry.value.size;
      const count = afterSize - beforeSize;

      ledis.setEntry(key, existingEntry);

      return Response.integer(count);
    }
  }

  static smembers(key) {
    const entry = ledis.getEntry(key, "set");

    if (entry === undefined) {
      return Response.emptyArray();
    }
    return Response.array([...entry.value]);
  }

  static srem(key, ...valueList) {
    //console.log("srem key: ", key, " valueList: ", valueList);

    const existingEntry = ledis.getEntry(key, "set");
    if (existingEntry === undefined) {
      return Response.emptyArray();
    }

    const sizeBefore = existingEntry.value.size;
    const set = existingEntry.value;

    valueList.forEach((value) => {
      set.delete(value);
    });
    const sizeAfter = existingEntry.value.size;

    return Response.integer(sizeBefore - sizeAfter);
  }

  static sinter(...listKey) {
    //console.log("sinter listKey: ", listKey);
    if (listKey.length === 0) {
      return Response.emptyArray();
    }
    let minIdx = 0;
    let minLen = Number.MAX_VALUE;

    const valueList = [];
    for (const [index, key] of listKey.entries()) {
      const entry = ledis.getEntry(key, "set");
      if (entry === undefined) {
        return Response.emptyArray();
      }
      if (entry.value.size < minLen) {
        minLen = entry.value.size;
        minIdx = index;
      }
      valueList.push(entry.value);
    }

    //console.log(valueList);
    const minSet = valueList[minIdx];
    const result = [...minSet].filter((value) => {
      let check = true;
      for (const set of valueList) {
        if (!set.has(value)) {
          // Changed from set.includes(value) to set.has(value)
          check = false;
          break;
        }
      }
      return check;
    });
    //console.log("result: ", result);
    if (result.length === 0) {
      return Response.emptyArray();
    }
    return Response.array(result);
  }
}

export default LSet;
