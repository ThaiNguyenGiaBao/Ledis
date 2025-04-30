import String from "./String.mjs";
import Set from "./Set.mjs";
import Key from "./Key.mjs";
import Response from "./Response.mjs";
import Entry from "./Entry.mjs";
class Ledis {
  constructor() {
    this.commands = new Map();
    this.data = new Map();
    this.clone = { data: null, timpestamp: null };
    this.save = this.save.bind(this);
    this.restore = this.restore.bind(this);
  }

  registerCommand(command, func) {
    this.commands.set(command, func);
  }

  execute(cmd) {
    const parseCmd = cmd
      .match(/"([^"]*)"|(\S+)/g)
      .map((s) => s.replace(/^"(.+)"$/, "$1"));
    const command = parseCmd[0];
    if (this.commands.has(command)) {
      const func = this.commands.get(command);
      console.log(func);
      console.log("parseCmd: ", parseCmd);
      let result = null;
      if (parseCmd.length === 1) {
        result = func();
      } else {
        result = func(...parseCmd.slice(1));
      }
      console.log(result);
      return result;
    }
    return Response.error(`command not found for '${command}'`);
  }
  
  setEntry(key, entry) {
    console.log("setEntry:: ", key, entry);
    let existingEntry = this.data.get(key);
    if (existingEntry && existingEntry.isExpired()) {
      this.removeEntry(key);
    }

    existingEntry = this.data.get(key);
    console.log("existingEntry: ", existingEntry);
    console.log("entry: ", entry);
    if (
      existingEntry &&
      entry.type != "string" &&
      existingEntry.type !== entry.type
    ) {
      throw new Error(`Type mismatch for key '${key}'`);
    }

    this.data.set(key, entry);
  }

  getEntry(key) {
    const entry = this.data.get(key);
    console.log("getEntry: ", key, entry);
    if (entry && entry.isExpired()) {
      this.removeEntry(key);
      return undefined;
    }
    return entry;
  }

  removeEntry(key) {
    this.data.delete(key);
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

  save(check) {
    if (check !== undefined) {
      return Response.error("Invalid number of arguments");
    }
    // Deep clone the data map

    console.log("save: ", this.data);
    this.clone.data = new Map();
    this.clone.timpestamp = Date.now();
    for (const [key, entry] of this.data.entries()) {
      const clonedEntry = JSON.parse(JSON.stringify(entry));
      this.clone.data.set(key, clonedEntry);
    }
    console.log("clone: ", this.clone);
    return this.clone.timpestamp;
  }
  restore(check) {
    if (check !== undefined) {
      return Response.error("Invalid number of arguments");
    }
    if (this.clone.data === null) {
      return Response.error("No data to restore");
    }

    this.data.clear();

    for (const [key, entry] of this.clone.data.entries()) {
      console.log("restore: ", key, entry);
      const clonedEntry = new Entry(entry.value, entry.expireAt, entry.type);
      this.data.set(key, clonedEntry);
    }
    return this.clone.timpestamp;
  }
}

const ledis = new Ledis();
ledis.registerCommand("set", String.set);
ledis.registerCommand("get", String.get);
ledis.registerCommand("sadd", Set.sadd);
ledis.registerCommand("srem", Set.srem);
ledis.registerCommand("smembers", Set.smembers);
ledis.registerCommand("sinter", Set.sinter);
ledis.registerCommand("keys", Key.keys);
ledis.registerCommand("del", Key.del);
ledis.registerCommand("expire", Key.expire);
ledis.registerCommand("ttl", Key.ttl);
ledis.registerCommand("save", ledis.save);
ledis.registerCommand("restore", ledis.restore);

export default Ledis;
export { ledis };
