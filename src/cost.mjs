/** All prices use the same currency per one million tokens. */
export function calculateCost(values) {
  const keys = ['inputTokens', 'outputTokens', 'inputPrice', 'outputPrice', 'cachePrice', 'hitRate', 'requests'];
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new TypeError('Supply a usage and pricing object.');
  }
  for (const key of keys) {
    if (!Number.isFinite(values[key]) || values[key] < 0) {
      throw new TypeError(`${key} must be a finite, non-negative number.`);
    }
  }
  for (const key of ['inputTokens', 'outputTokens', 'requests']) {
    if (!Number.isSafeInteger(values[key])) throw new RangeError(`${key} must be a safe integer.`);
  }
  if (values.hitRate > 100) throw new RangeError('Cache hit rate cannot exceed 100%.');
  const { inputTokens, outputTokens, inputPrice, outputPrice, cachePrice, hitRate, requests } = values;
  const cachedTokens = inputTokens * hitRate / 100;
  const input = (inputTokens - cachedTokens) / 1_000_000 * inputPrice + cachedTokens / 1_000_000 * cachePrice;
  const output = outputTokens / 1_000_000 * outputPrice;
  const total = input + output;
  const baseline = inputTokens / 1_000_000 * inputPrice + output;
  const saving = cachedTokens / 1_000_000 * (inputPrice - cachePrice);
  const result = { input, output, total, baseline, saving, monthly: total * requests,
    percentage: baseline === 0 ? null : saving / baseline * 100 };
  if (Object.values(result).some(value => value !== null && !Number.isFinite(value))) {
    throw new RangeError('The estimate exceeds the supported numeric range.');
  }
  return result;
}
