import { calculateCost } from './cost.mjs';

const form = document.querySelector('form');
const error = document.querySelector('#error');
const result = document.querySelector('#result');
const money = value => `$${value.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
function render() {
  document.querySelector('#hit-rate').textContent = `${form.elements.hitRate.value}%`;
  try {
    const raw = Object.fromEntries(new FormData(form));
    if (Object.values(raw).some(value => !value.trim())) throw new Error('Fill in every usage and price field.');
    const estimate = calculateCost(Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Number(value)])));
    for (const key of ['input', 'output', 'total', 'baseline', 'monthly']) {
      document.querySelector(`#${key}`).textContent = money(estimate[key]);
    }
    document.querySelector('#saving').textContent = estimate.saving < 0
      ? `Caching adds ${money(-estimate.saving)} per request at these prices.`
      : estimate.percentage === null
        ? 'No percentage comparison is available because the uncached baseline is zero.'
        : `Estimated saving: ${money(estimate.saving)} per request (${estimate.percentage.toFixed(1)}%).`;
    result.hidden = false;
    error.hidden = true;
    error.textContent = '';
  } catch (cause) {
    result.hidden = true;
    error.hidden = false;
    error.textContent = cause instanceof Error ? cause.message : 'Check the supplied values.';
  }
}
form.addEventListener('input', render);
form.addEventListener('submit', event => event.preventDefault());
form.addEventListener('reset', () => setTimeout(render, 0));
render();
