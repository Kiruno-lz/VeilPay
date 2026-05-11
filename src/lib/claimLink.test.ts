import { describe, it, expect } from "vitest";
// Bun's mock.module() is file-scoped but persists across the process, so other
// test files that mock ../lib/claimLink leak their mock into this module. By
// dynamically importing with a cache-busting query string we bypass the mock
// and guarantee that claimLink tests always use the authentic implementation
// regardless of test mocking order.
const { generateClaimLink, parseClaimToken } = await import("./claimLink?bust=claimLink-test");

describe("claimLink", () => {
  const payload = {
    commitment: "abc123",
    note: "test note",
    amount: 100,
    recipient: "recipient-address",
  };

  it("valid token parsing returns correct payload", async () => {
    const token = await generateClaimLink(payload);
    const parsed = await parseClaimToken(token);
    expect(parsed).toEqual(payload);
  });

  it("invalid token returns null", async () => {
    const result = await parseClaimToken("invalid-token");
    expect(result).toBeNull();
  });

  it("malformed token returns null", async () => {
    const result = await parseClaimToken("not-a-jwt");
    expect(result).toBeNull();
  });

  it("expired token returns null", async () => {
    // Create a token that is already expired by manipulating the JWT
    const token = await generateClaimLink(payload);
    // Modify the payload to make it expired by changing the exp claim
    const parts = token.split(".");
    const modifiedPayload = JSON.parse(atob(parts[1]));
    modifiedPayload.exp = Math.floor(Date.now() / 1000) - 1; // expired 1 second ago
    const modifiedToken = `${parts[0]}.${btoa(JSON.stringify(modifiedPayload))}.${parts[2]}`;
    const result = await parseClaimToken(modifiedToken);
    expect(result).toBeNull();
  });

  it("tampered token returns null", async () => {
    const token = await generateClaimLink(payload);
    // Tamper with the payload
    const tamperedToken = token.slice(0, -5) + "xxxxx";
    const result = await parseClaimToken(tamperedToken);
    expect(result).toBeNull();
  });

  it("generateClaimLink produces a valid parseable token", async () => {
    const token = await generateClaimLink(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);
    const parsed = await parseClaimToken(token);
    expect(parsed).toEqual(payload);
  });
});
