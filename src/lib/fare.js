export const RATES = {
  economy: { base: 30, perKm: 12 },
  premium: { base: 60, perKm: 20 },
  bike: { base: 15, perKm: 7 },
};
export const PROMOS = { WELCOME10: 0.1, SAVE20: 0.2 };

export function calcFare(km, type = "economy", promo = "") {
  const r = RATES[type];
  if (!r || !(km > 0)) return 0;
  const discount = PROMOS[(promo || "").toUpperCase()] || 0;
  const fare = (r.base + r.perKm * km) * (1 - discount);
  return Math.max(Math.round(fare * 100) / 100, 20);
}