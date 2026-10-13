import { describe, it, expect } from "vitest";
import { calcFare } from "./fare.js";

describe("calcFare", () => {
  it("economy 10km = 150", () => expect(calcFare(10, "economy")).toBe(150));
  it("promo 10% off", () => expect(calcFare(10, "economy", "WELCOME10")).toBe(135));
  it("invalid type = 0", () => expect(calcFare(10, "xyz")).toBe(0));
  it("zero km = 0", () => expect(calcFare(0, "economy")).toBe(0));
  it("minimum fare 20", () => expect(calcFare(0.1, "bike")).toBe(20));
});