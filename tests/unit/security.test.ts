import { describe, expect, it } from "vitest";
import { getAllowedOrigins, isAllowedOrigin, rateLimit, redactLeadForLogs } from "@/lib/security";

describe("security helpers", () => {
  it("validates allowed origins", () => {
    const allowed = getAllowedOrigins("https://localprodirectory.chexustudio.com,http://localhost:4321");
    expect(isAllowedOrigin("https://localprodirectory.chexustudio.com", allowed)).toBe(true);
    expect(isAllowedOrigin("https://evil.example", allowed)).toBe(false);
  });

  it("rate limits repeated keys", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, 5, 60_000).allowed).toBe(true);
    }
    expect(rateLimit(key, 5, 60_000).allowed).toBe(false);
  });

  it("redacts personal fields from logs", () => {
    const redacted = redactLeadForLogs({
      name: "Alex",
      email: "alex@example.com",
      message: "hello",
    });
    expect(redacted.name).toBe("[redacted]");
    expect(redacted.email).toBe("[redacted]");
    expect(redacted.message).toBe("[redacted]");
  });
});
