import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { calculateCost } from '../src/cost.mjs';
import { createPreviewServer } from '../scripts/serve.mjs';

const input = { inputTokens: 10000, outputTokens: 1000, inputPrice: 2, outputPrice: 8, cachePrice: 0.2, hitRate: 50, requests: 10000 };
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
test('half the input cached produces a hand-calculated $190 monthly estimate', () => {
  const result = calculateCost(input);
  close(result.input, 0.011); close(result.output, 0.008); close(result.total, 0.019);
  close(result.baseline, 0.028); close(result.saving, 0.009); close(result.monthly, 190);
});
test('zero and full cache hits retain output cost', () => {
  close(calculateCost({ ...input, hitRate: 0 }).total, 0.028);
  close(calculateCost({ ...input, hitRate: 100 }).total, 0.01);
});
test('a more expensive cache reports negative savings', () => {
  assert.ok(calculateCost({ ...input, cachePrice: 3 }).saving < 0);
});
test('zero baseline has no meaningful percentage, including a paid cache', () => {
  assert.equal(calculateCost({ ...input, inputPrice: 0, outputPrice: 0 }).percentage, null);
  close(calculateCost({ ...input, inputTokens: 0, outputTokens: 0 }).total, 0);
});
test('reject missing fields, non-numbers, invalid counts, and invalid hit rates', () => {
  for (const value of [null, [], {}, { ...input, cachePrice: undefined }, { ...input, inputPrice: '2' },
    { ...input, outputPrice: Infinity }, { ...input, inputTokens: -1 }, { ...input, requests: 1.5 },
    { ...input, inputTokens: Number.MAX_SAFE_INTEGER + 1 }, { ...input, hitRate: 101 }]) {
    assert.throws(() => calculateCost(value));
  }
});
test('reject numeric overflow and accept zero monthly requests', () => {
  assert.throws(() => calculateCost({ ...input, inputPrice: Number.MAX_VALUE, requests: Number.MAX_SAFE_INTEGER }), /numeric range/);
  assert.equal(calculateCost({ ...input, requests: 0 }).monthly, 0);
});
test('preview serves only public assets and rejects writes', async t => {
  const server = createPreviewServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(base);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /LLM Cost Calculator/);
  assert.equal((await fetch(`${base}/src/cost.mjs`)).status, 200);
  assert.equal((await fetch(`${base}/package.json`)).status, 404);
  assert.equal((await fetch(`${base}/.env`)).status, 404);
  assert.equal((await fetch(base, { method: 'POST' })).status, 405);
  assert.equal(await (await fetch(base, { method: 'HEAD' })).text(), '');
});
