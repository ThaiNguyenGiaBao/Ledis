import String from "./String.mjs";
import Set from "./Set.mjs";
import Key from "./Key.mjs";
import Response from "./Response.mjs";
class Ledis {
  static data = new Map();
  constructor() {
    this.commands = new Map();
    this.commands.set("set", String.set);
    this.commands.set("get", String.get);
    this.commands.set("sadd", Set.sadd);
    this.commands.set("srem", Set.srem);
    this.commands.set("smembers", Set.smembers);
    this.commands.set("sinter", Set.sinter);
    this.commands.set("keys", Key.keys);
    this.commands.set("del", Key.del);
    this.commands.set("expire", Key.expire);
    this.commands.set("ttl", Key.ttl);
  }

  execute(cmd) {
    const parseCmd = cmd.split(" ");
    const command = parseCmd[0];
    if (this.commands.has(command)) {
      const func = this.commands.get(command);
      console.log(func);
      console.log("parseCmd: ", ...parseCmd.slice(1));
      const result = func(...parseCmd.slice(1));
      console.log(result);
      return result;
    }
    return Response.error(`command not found for '${command}'`);
  }
  static setEntry(key, entry) {
    console.log("setEntry:: ", key, entry);
    let existingEntry = this.data.get(key);
    if (existingEntry && existingEntry.isExpired()) {
      this.removeEntry(key);
    }

    existingEntry = this.data.get(key);
    if (existingEntry && existingEntry.type !== entry.type) {
      throw new Error(`Error: Type mismatch for key '${key}'`);
    }

    this.data.set(key, entry);
  }

  static getEntry(key) {
    const entry = this.data.get(key);
    console.log("getEntry: ", key, entry);
    if (entry && entry.isExpired()) {
      this.removeEntry(key);
      return undefined;
    }
    return entry;
  }

  static removeEntry(key) {
    this.data.delete(key);
  }
  static getAllKeys() {
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
}

export default Ledis;
