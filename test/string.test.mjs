import { ledis } from "../src/Ledis.mjs";
import { describe, it, expect } from "vitest";
import Response from "../src/Response.mjs";

describe("STRING", () => {
  it("should return OK on SET", () => {
    const result = ledis.execute("SET name bao");
    expect(result).toBe(Response.string("OK"));
  });

  it("should overwrite value if key already exists", () => {
    ledis.execute("SET name bao");
    const result = ledis.execute("SET name john");
    expect(result).toBe(Response.string("OK"));

    const getResult = ledis.execute("GET name");
    expect(getResult).toBe(Response.string("john"));
  });

  it("should return the correct value on GET", () => {
    ledis.execute("SET city hcmc");
    const result = ledis.execute("GET city");
    expect(result).toBe(Response.string("hcmc"));
  });

  it("should return NULL for nonexistent key on GET", () => {
    const result = ledis.execute("GET unknownKey");
    expect(result).toBe(Response.nil());
  });

  it("should handle SET with numeric strings", () => {
    const result = ledis.execute("SET count 12345");
    expect(result).toBe(Response.string("OK"));

    const getResult = ledis.execute("GET count");
    expect(getResult).toBe(Response.string("12345"));
  });

  it("should handle SET and GET with empty string", () => {
    ledis.execute("SET empty ''");
    const result = ledis.execute("GET empty");
    expect(result).toBe(Response.string("''")); // depends on how you parse this
  });

  it("should be case sensitive for keys", () => {
    ledis.execute("SET Name Bao");
    ledis.execute("SET name bao");

    expect(ledis.execute("GET Name")).toBe(Response.string("Bao"));
    expect(ledis.execute("GET name")).toBe(Response.string("bao"));
  });
  it("valid number of args", () => {
    const result = ledis.execute("SET name bao bao");
    expect(result).toBe(Response.error("Invalid number of arguments"));
  });
  it("should return error for invalid number of args", () => {
    const result = ledis.execute("SET name");
    expect(result).toBe(Response.error("Invalid number of arguments"));
  });
});
