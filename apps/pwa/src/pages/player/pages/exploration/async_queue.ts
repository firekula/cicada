import AsyncQueue from '#/utils/async_queue';

export class AbortError extends Error {}

export default new AsyncQueue({
  taskMinDuration: 100,
  taskTimeout: 5000,
  abortErrorGenerator: () => new AbortError(),
});
