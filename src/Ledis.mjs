import String from "./Type/String.mjs";
import LSet from "./Type/Set.mjs";
import Key from "./Key.mjs";
import Response from "./Response.mjs";
import Entry from "./Entry.mjs";
import { asyncHandler } from "./utils.mjs";

class Ledis {
  constructor() {
    this.commands = new Map();
    this.data = new Map();
    this.clone = { data: null, timestamp: null };
    this.save = this.save.bind(this);
    this.restore = this.restore.bind(this);
    this.clear = this.clear.bind(this);
    this.loadData();
  }

  registerCommand(command, func) {
    this.commands.set(command, func);
  }

  loadData() {
    console.log("loadData:");
    if (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    ) {
      const serialized = localStorage.getItem("snapshot");
      if (serialized) {
        const { timestamp, data } = JSON.parse(serialized);
        console.log("loaded data: ", data);
        this.clone.timestamp = timestamp;
        this.clone.data = new Map();
        for (const [key, entry] of data) {
          const clonedEntry = JSON.parse(JSON.stringify(entry));
          this.clone.data.set(key, clonedEntry);
        }
      }
    }
  }

  execute(cmd) {
    cmd = cmd.trim();
    const parseCmd = cmd
      .match(/"([^"]*)"|(\S+)/g)
      .map((s) => s.replace(/^"(.+)"$/, "$1"));
    const command = parseCmd[0].toLowerCase();
    if (this.commands.has(command)) {
      const func = this.commands.get(command);
      //console.log(func);
      //console.log("parseCmd: ", parseCmd);
      let result = null;
      if (parseCmd.length === 1) {
        result = func();
      } else {
        result = func(...parseCmd.slice(1));
      }
      //console.log(result);
      return result;
    }
    return Response.error(`command not found for '${command}'`);
  }

  setEntry(key, entry) {
    //console.log("setEntry:: ", key, entry);
    let existingEntry = this.data.get(key);
    if (existingEntry && existingEntry.isExpired()) {
      this.removeEntry(key);
    }

    existingEntry = this.data.get(key);

    if (
      existingEntry &&
      entry.type != "string" &&
      existingEntry.type !== entry.type
    ) {
      throw new Error(`Type mismatch for key '${key}'`);
    }

    this.data.set(key, entry);
  }

  getEntry(key, type = undefined) {
    const entry = this.data.get(key);
    //console.log("getEntry: ", key, entry);
    if (entry === undefined) {
      return undefined;
    }
    if (entry.isExpired()) {
      this.removeEntry(key);
      return undefined;
    }
    if (type != undefined && entry.type != type) {
      throw new Error(`Type mismatch for key '${key}'`);
    }
    return entry;
  }

  removeEntry(key) {
    this.data.delete(key);
  }

  clear() {
    this.data.clear();
    return Response.ok();
  }

  getAllKeys() {
    const response = [];
    for (const [key, entry] of this.data.entries()) {
      if (!entry.isExpired()) {
        response.push(key);
      } else {
        this.removeEntry(key);
      }
    }
    return response;
  }

  save() {
    // Deep clone the data map
    console.log("save: ", this.data);
    this.clone.data = new Map();
    this.clone.timestamp = Date.now();

    for (const [key, entry] of this.data.entries()) {
      const clonedEntry = JSON.parse(JSON.stringify(entry));
      if (entry.type === "set") {
        clonedEntry.value = [...entry.value];
      }
      this.clone.data.set(key, clonedEntry);
    }

    if (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    ) {
      const serialized = JSON.stringify({
        timestamp: this.clone.timestamp,
        data: Array.from(this.clone.data.entries()),
      });
      localStorage.setItem("snapshot", serialized);
      console.log("Saved to localStorage:", serialized);
    }

    console.log("clone: ", this.clone);
    return this.clone.timestamp;
  }
  restore() {
    if (this.clone.data === null) {
      return Response.error("No snapshot available");
    }

    this.data.clear();

    for (const [key, entry] of this.clone.data.entries()) {
      console.log("restore: ", key, entry);
      if (entry.type === "set") {
        entry.value = new Set(entry.value);
      }
      const clonedEntry = new Entry(entry.value, entry.expireAt, entry.type);
      this.data.set(key, clonedEntry);
    }

    return this.clone.timestamp;
  }
  garbageCollector() {
    setInterval(() => {
      console.log("Garbage collector running...");
      for (const [key, entry] of this.data.entries()) {
        if (entry.isExpired()) {
          console.log("Removing expired entry: ", key, entry);
          this.removeEntry(key);
        }
      }
    }, 5000);
  }
}

const ledis = new Ledis();
ledis.registerCommand("set", asyncHandler(String.set));
ledis.registerCommand("get", asyncHandler(String.get));
ledis.registerCommand("sadd", asyncHandler(LSet.sadd, false, 2));
ledis.registerCommand("srem", asyncHandler(LSet.srem, false, 2));
ledis.registerCommand("smembers", asyncHandler(LSet.smembers));
ledis.registerCommand("sinter", asyncHandler(LSet.sinter, false, 1));
ledis.registerCommand("keys", asyncHandler(Key.keys));
ledis.registerCommand("del", asyncHandler(Key.del));
ledis.registerCommand("expire", asyncHandler(Key.expire));
ledis.registerCommand("ttl", asyncHandler(Key.ttl));
ledis.registerCommand("save", asyncHandler(ledis.save));
ledis.registerCommand("restore", asyncHandler(ledis.restore));
ledis.registerCommand("flushall", asyncHandler(ledis.clear));

ledis.garbageCollector();

export default Ledis;
export { ledis };
