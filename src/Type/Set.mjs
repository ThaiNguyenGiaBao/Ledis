import Entry from "../Entry.mjs";
import { ledis } from "../Ledis.mjs";

import Response from "../Response.mjs";

class Set {
  static sadd(key, ...valueList) {
    console.log("sadd key: ", key, " valueList: ", valueList);

    const entry = ledis.getEntry(key, "set");

    if (entry === undefined) {
      // remove all duplicates from the set
      let list = [];
      for (const value of valueList) {
        if (!list.includes(value)) {
          list.push(value);
        }
      }

      const entry = new Entry(list, null, "set");

      ledis.setEntry(key, entry);

      return Response.integer(list.length);
    } else {
      const existingEntry = ledis.getEntry(key, "set");

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

  static smembers(key) {
    const entry = ledis.getEntry(key, "set");

    if (entry === undefined) {
      return Response.emptyArray();
    }
    return Response.array(entry.value);
  }

  static srem(key, ...valueList) {
    console.log("srem key: ", key, " valueList: ", valueList);

    const existingEntry = ledis.getEntry(key, "set");
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
    console.log("sinter listKey: ", listKey);
    let minIdx = 0;
    let minLen = Number.MAX_VALUE;

    const valueList = [];
    for (const [index, key] of listKey.entries()) {
      const entry = ledis.getEntry(key, "set");
      if (entry === undefined) {
        return Response.emptyArray();
      }
      if (entry.value.length < minLen) {
        minLen = entry.value.length;
        minIdx = index;
      }
      valueList.push(entry.value);
    }

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
