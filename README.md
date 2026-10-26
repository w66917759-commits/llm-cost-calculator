# LLM Cost Calculator

Built by **[SaveMyToken](https://savemytoken.com)**.

Related project: **[SI-API](https://siapi.ai)**.

A local calculator for estimating language-model costs from your token counts, prices, request volume, and cache hit rates. Includes a browser interface and a reusable JavaScript function. No API keys, external services, or dependencies are needed.

## Run locally

Install Node.js 22 or newer, then run from this directory:

```sh
npm start
```

Open [localhost:4173](http://127.0.0.1:4173). Use `PORT=4180 npm start` to change the port. Calculations happen in your browser; there is no telemetry or external API call. The development server binds only to your computer's loopback interface.

Run checks with `npm test`. There is no install or build step. To host the interface, serve `index.html`, `styles.css`, and `src/` at a static site's root.

## What it calculates

- Compare input, output, and total costs using prices you supply.
- Compare cache-aware cost estimates with an uncached baseline.
- Explain assumptions and distinguish estimates from actual provider billing.
- Run a responsive browser interface or import the calculation function directly.

## Use the function

```js
import { calculateCost } from './src/cost.mjs';

const estimate = calculateCost({
  inputTokens: 10000,
  outputTokens: 1000,
  inputPrice: 2,
  outputPrice: 8,
  cachePrice: 0.2,
  hitRate: 50,
  requests: 10000,
});

console.log(estimate.monthly); // 190, with normal floating-point rounding
```

These prices are examples, not current provider quotes. All three prices must use the same currency per one million tokens. The interface labels the currency USD; the pure function uses whichever consistent currency you supply. Token and request counts must be non-negative safe integers; hit rate is a percentage from 0 to 100.

The example has 5,000 uncached input tokens at $2/M ($0.010), 5,000 cached input tokens at $0.2/M ($0.001), and 1,000 output tokens at $8/M ($0.008): **$0.019 per request, or $190 for 10,000 requests**.

The returned fields are `input`, `output`, `total`, `baseline` (without caching), `saving`, `monthly`, and `percentage`. Negative savings mean the cache price increases costs. A zero uncached baseline returns `percentage: null` because the comparison is undefined.

## Assumptions

Requests share the supplied average token counts and hit rate. Cached input replaces the corresponding uncached input charge. Output prices remain unchanged. Cache writes, storage, minimum charges, tiered pricing, tools, retries, taxes, and discounts are not modeled. Use provider invoices for actual billing. Ordinary floating-point arithmetic makes this unsuitable for financial accounting.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md). Code and documentation are available under the [MIT license](LICENSE).

## Learn more

Visit [SaveMyToken](https://savemytoken.com) for practical AI guides and token-cost learning resources.
