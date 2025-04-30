import { ledis } from "../src/Ledis.mjs";
import { describe, it, expect } from "vitest";
import Response from "../src/Response.mjs";

describe("SET", () => {
  it("should add a single value to a set ", () => {
    const result = ledis.execute("SADD fruits apple");
    expect(result).toBe(Response.integer(1)); // 1 added
  });

  it("should add multiple values to a set", () => {
    const result = ledis.execute("SADD fruits banana orange");
    expect(result).toBe(Response.integer(2)); // 2 new added
  });

  it("should ignore duplicates on SADD", () => {
    const result = ledis.execute("SADD fruits banana mango");
    expect(result).toBe(Response.integer(1)); // only mango is new
  });

  it("should return all members with SMEMBERS", () => {
    const result = ledis.execute("SMEMBERS fruits");
    const expected = Response.array(["apple", "banana", "orange", "mango"]);
    expect(result).toBe(expected); // unordered OK if spec says so
  });

  it("should remove values with SREM", () => {
    const result = ledis.execute("SREM fruits banana orange");
    expect(result).toBe(Response.integer(2));
  });

  it("should ignore non-existent members on SREM", () => {
    const result = ledis.execute("SREM fruits banana apple");
    expect(result).toBe(Response.integer(1));
  });

  it("should show updated set after removals", () => {
    const result = ledis.execute("SMEMBERS fruits");
    expect(result).toBe(Response.array(["mango"]));
  });

  it("should return empty array for SMEMBERS on empty/non-existent set", () => {
    const result = ledis.execute("SMEMBERS unknownSet");
    expect(result).toBe(Response.array([]));
  });

  it("should compute intersection with SINTER", () => {
    ledis.execute("SADD set1 a b c");
    ledis.execute("SADD set2 b c d");
    ledis.execute("SADD set3 c d e");

    const result = ledis.execute("SINTER set1 set2 set3");
    expect(result).toBe(Response.array(["c"])); // only 'c' is in all 3
  });

  it("should return empty array on SINTER with no common members", () => {
    ledis.execute("SADD sa x y");
    ledis.execute("SADD sb a b");
    const result = ledis.execute("SINTER sa sb");
    expect(result).toBe(Response.array([]));
  });

  it("should return empty array on SINTER for non-existent key", () => {
    const result = ledis.execute("SINTER set1 unknown");
    expect(result).toBe(Response.array([])) ;
  });
}); 

describe("SET performance stress test", () => {
  const N = 50000;

  it(`should add ${N} unique members `, () => {
    // wipe any previous data
    ledis.execute("DEL perfSet");
    // batch in chunks of 1000 to avoid super-long command strings
    for (let i = 0; i < N; i += 1000) {
      const chunk = Array.from(
        { length: Math.min(1000, N - i) },
        (_, k) => `v${i + k}`
      ).join(" ");
      ledis.execute(`SADD perfSet  ${chunk}`);
    }
  }, 30_000);

  it(`SMEMBERS on ${N} items returns all `, () => {
    ledis.execute("SMEMBERS perfSet");
  }, 30_000);

  it(`should intersect two large sets`, () => {
    // prepare a second set that overlaps by half
    ledis.execute("DEL perfSet2");
    for (let i = 0; i < N; i += 1000) {
      const chunk = Array.from(
        { length: Math.min(1000, N - i + 1) },
        (_, k) => `v${Math.floor((i + k) / 2)}`
      ).join(" ");
      ledis.execute(`SADD perfSet2 ${chunk}`);
    }

    ledis.execute("DEL perfSet3");
    for (let i = 0; i < N; i += 1000) {
      const chunk = Array.from(
        { length: Math.min(1000, N - i + 2) },
        (_, k) => `v${Math.floor((i + k) / 2)}`
      ).join(" ");
      ledis.execute(`SADD perfSet3 ${chunk}`);
    }

    ledis.execute("SINTER perfSet perfSet2 perfSet3");
  }, 30_000);
});
