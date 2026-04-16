const { calculateCost } = require('../../src/lib/cost');

describe('calculateCost', () => {
  const settings = { electricity_kwh_price: '0.75', printer_power_watts: '200' };

  it('returns 0 when no materials and no print time', () => {
    expect(calculateCost(0, [], settings)).toBe(0);
  });

  it('calculates material cost only', () => {
    const materials = [
      { quantity_grams: 100, price_per_gram: 0.05 },
      { quantity_grams: 50,  price_per_gram: 0.10 },
    ];
    // 100 * 0.05 + 50 * 0.10 = 5 + 5 = 10
    expect(calculateCost(0, materials, settings)).toBe(10);
  });

  it('calculates electricity cost only', () => {
    // 60 min * (200W / 1000) * 0.75 kwh = 1h * 0.2kw * 0.75 = 0.15
    expect(calculateCost(60, [], settings)).toBeCloseTo(0.15);
  });

  it('calculates combined cost', () => {
    const materials = [{ quantity_grams: 100, price_per_gram: 0.05 }]; // 5.00
    // electricity: 60min = 1h * 0.2kw * 0.75 = 0.15
    expect(calculateCost(60, materials, settings)).toBeCloseTo(5.15);
  });

  it('handles missing settings gracefully', () => {
    expect(calculateCost(60, [], {})).toBe(0);
  });
});
