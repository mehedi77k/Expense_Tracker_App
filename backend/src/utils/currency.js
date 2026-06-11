function toMoney(value) {
  return Number.parseFloat(Number(value || 0).toFixed(2));
}

module.exports = { toMoney };
