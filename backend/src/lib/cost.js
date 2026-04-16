function calculateCost(printTimeMinutes, productMaterials, settings) {
  const materialCost = productMaterials.reduce((sum, pm) => {
    return sum + parseFloat(pm.quantity_grams) * parseFloat(pm.price_per_gram);
  }, 0);

  const kwh   = parseFloat(settings.electricity_kwh_price || 0);
  const watts = parseFloat(settings.printer_power_watts   || 0);
  const hours = (printTimeMinutes || 0) / 60;
  const electricityCost = hours * (watts / 1000) * kwh;

  return parseFloat((materialCost + electricityCost).toFixed(4));
}

module.exports = { calculateCost };
