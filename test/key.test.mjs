import { ledis } from "../src/Ledis.mjs";
import { describe, it, expect, beforeEach } from "vitest";
import Response from "../src/Response.mjs";

describe("DATA EXPIRATION", () => {
  beforeEach(() => {
    ledis.clear();
  });

  it("should set a key and expire it after a few seconds", async () => {
    ledis.execute("SET mykey value");
    const expireResult = ledis.execute("EXPIRE mykey 2");
    expect(expireResult).toBe(Response.integer(2));

    const ttl1 = ledis.execute("TTL mykey");
    expect(ttl1).toBe(Response.integer(1));

    const getBefore = ledis.execute("GET mykey");
    expect(getBefore).toBe(Response.string("value"));

    await new Promise((r) => setTimeout(r, 2100)); // wait 2.1s

    const getAfter = ledis.execute("GET mykey");
    expect(getAfter).toBe(Response.nil());

    const ttl2 = ledis.execute("TTL mykey");
    expect(ttl2).toBe(Response.integer(-2)); // -2: key does not exist
  });

  it("should return -1 TTL for key with no expiration", () => {
    ledis.execute("SET temp test");
    const ttl = ledis.execute("TTL temp");
    expect(ttl).toBe(Response.integer(-1)); // Redis returns -1 for no expiration
  });

  it("should return -2 TTL for nonexistent key", () => {
    const ttl = ledis.execute("TTL nosuchkey");
    expect(ttl).toBe(Response.integer(-2));
  });

  it("should return 0 from EXPIRE if key does not exist", () => {
    const result = ledis.execute("EXPIRE ghost 10");
    expect(result).toBe(Response.integer(0));
  });

  it("should remove expiration if key is overwritten", () => {
    ledis.execute("SET mykey hello");
    ledis.execute("EXPIRE mykey 3");

    ledis.execute("SET mykey overwritten"); // overwrites and removes expiration

    const ttl = ledis.execute("TTL mykey");
    expect(ttl).toBe(Response.integer(-1));

    const value = ledis.execute("GET mykey");
    expect(value).toBe(Response.string("overwritten"));
  });

  it("should list key only if not expired", async () => {
    ledis.clear(); // clear all keys
    ledis.execute("SET visible 123");
    ledis.execute("SET temp 999");
    ledis.execute("EXPIRE temp 1");

    const keysBefore = ledis.execute("KEYS");
    expect(keysBefore).toBe(Response.array(["visible", "temp"]));

    await new Promise((r) => setTimeout(r, 1500)); // wait 1.1s

    const keysAfter = ledis.execute("KEYS");
    expect(keysAfter).toBe(Response.array(["visible"]));
  });
});
