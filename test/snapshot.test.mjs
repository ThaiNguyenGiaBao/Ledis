import { ledis } from "../src/Ledis.mjs";
import { describe, it, expect, beforeEach } from "vitest";
import Response from "../src/Response.mjs";

describe("SNAPSHOT", () => {
  beforeEach(() => {
    // Reset entire DB for each test
    ledis.execute("flushall");
  });
  it("should error on RESTORE without prior SAVE", () => {
    // no SAVE called
    const res = ledis.execute("RESTORE");
    expect(res).toBe(Response.error("No snapshot available"));
  });

  it("should save and restore simple key/value state", () => {
    // initial state
    expect(ledis.execute("SET a first")).toBe(Response.string("OK"));
    // snapshot it
    ledis.execute("SAVE");

    // mutate after snapshot
    expect(ledis.execute("SET a second")).toBe(Response.string("OK"));
    expect(ledis.execute("GET a")).toBe(Response.string("second"));

    // restore to snapshot
    ledis.execute("RESTORE");
    // now 'a' should be back to "first"
    expect(ledis.execute("GET a")).toBe(Response.string("first"));
  });

  it("should snapshot and restore multiple keys and types", () => {
    // set up strings
    ledis.execute("SET x 100");
    ledis.execute("SET y 200");
    // set up a set
    ledis.execute("SADD myset one two");

    ledis.execute("SAVE");

    // change all
    ledis.execute("SET x 111");
    ledis.execute("DEL y");
    ledis.execute("SREM myset two");

    // verify changes applied
    expect(ledis.execute("GET x")).toBe(Response.string("111"));
    expect(ledis.execute("GET y")).toBe(Response.nil());
    expect(ledis.execute("SMEMBERS myset")).toBe(Response.array(["one"]));

    // restore
    ledis.execute("RESTORE");

    // original values back
    expect(ledis.execute("GET x")).toBe(Response.string("100"));
    expect(ledis.execute("GET y")).toBe(Response.string("200"));
    // set restored fully
    expect(ledis.execute("SMEMBERS myset")).toBe(
      Response.array(["one", "two"])
    );
  });

  it("should allow multiple save points but restore only the last", () => {
    ledis.execute("SET k val1");
    ledis.execute("SAVE");

    ledis.execute("SET k val2");
    ledis.execute("SAVE");

    // now k == val2
    expect(ledis.execute("GET k")).toBe(Response.string("val2"));

    // restore — should go back to snapshot #2 (val2)?
    // If you design snapshots as a stack, restore pops last: goes to val2’s snapshot,
    // and second restore would go to val1.
    ledis.execute("RESTORE");
    expect(ledis.execute("GET k")).toBe(Response.string("val2"));
  });
});
