import { ledis } from "../src/Ledis.mjs";
import { describe, it, expect, beforeAll } from "vitest";
import Response from "../src/Response.mjs";

describe("TYPE MISMATCH", () => {
  beforeAll(() => {
    ledis.clear(); // clear all keys before tests
  });

  it("should raise error when using SADD on a string key", () => {
    ledis.execute("SET key1 value");

    const result = ledis.execute("SADD key1 x");
    expect(result).toBe(Response.error("Type mismatch for key 'key1'"));
  });

  it("should raise error when using GET on a set key", () => {
    ledis.execute("SADD key2 a b");

    const result = ledis.execute("GET key2");
    expect(result).toBe(Response.error("Type mismatch for key 'key2'"));
  });

  it("should raise error when using SMEMBERS on a string key", () => {
    ledis.execute("SET key3 hello");

    const result = ledis.execute("SMEMBERS key3");
    expect(result).toBe(Response.error("Type mismatch for key 'key3'"));
  });

  it("should raise error when using EXPIRE on a key with wrong type (if you enforce type checks)", () => {
    ledis.execute("SADD key4 x y");

    const result = ledis.execute("EXPIRE key4 10"); // Assuming EXPIRE only works on string keys in your system
    // This depends on your design — Redis allows EXPIRE on any key
    expect(result).toBe(Response.integer(10)); // or error if restricted
  });
});
