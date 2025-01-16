/**
 * From https://github.com/Agoric/agoric-sdk/blob/442f07c8f0af03281b52b90e90c27131eef6f331/multichain-testing/tools/sleep.ts#L10
 *
 * @param {number} ms
 * @param {{log: (message: string) => void, setTimeout: typeof global.setTimeout}} io
 */
export const sleep = (ms, { log = () => {}, setTimeout }) =>
  new Promise(resolve => {
    log(`Sleeping for ${ms}ms...`);
    setTimeout(resolve, ms);
  });

/**
 * From https://github.com/Agoric/agoric-sdk/blob/442f07c8f0af03281b52b90e90c27131eef6f331/multichain-testing/tools/sleep.ts#L24
 *
 * @template [T=unknown]
 * @param {() => Promise<T>} operation
 * @param {(result: T) => boolean} condition
 * @param {string} message
 * @param {RetryOptions & {log?: typeof console.log, setTimeout: typeof global.setTimeout}} options
 * @returns {Promise<T>}
 */
export const retryUntilCondition = async (
  operation,
  condition,
  message,
  {
    maxRetries = 6,
    retryIntervalMs = 3500,
    reusePromise = false,
    renderResult = x => x,
    // XXX mixes ocaps with configuration options
    log = console.log,
    setTimeout,
  },
) => {
  console.log({ maxRetries, retryIntervalMs, message });

  await null; // separate sync prologue

  const timedOut = Symbol('timed out');
  let retries = 0;
  /** @type {Promise | undefined } */
  let resultP;
  while (retries < maxRetries) {
    try {
      if (!reusePromise || !resultP) {
        resultP = operation();
        const makeCleanup = ref => {
          const cleanup = () => {
            if (resultP === ref) {
              resultP = undefined;
            }
          };
          return cleanup;
        };
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        resultP.finally(makeCleanup(resultP));
      }
      const result = await Promise.race([
        resultP,
        // Overload the retryIntervalMs to apply both *to* and *between* iterations
        sleep(retryIntervalMs, { log() {}, setTimeout }).then(() => timedOut),
      ]);
      if (result === timedOut) {
        log(`Attempt ${retries + 1} timed out`);
        if (!reusePromise) resultP = undefined;
      } else {
        log('RESULT', renderResult(result));
        if (condition(result)) {
          return result;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        log(`Error: ${error.message}: ${error.stack}`);
      } else {
        log(`Unknown error: ${String(error)}`);
      }
    }

    retries += 1;
    console.log(
      `Retry ${retries}/${maxRetries} - Waiting for ${retryIntervalMs}ms for ${message}...`,
    );
    await sleep(retryIntervalMs, { log, setTimeout });
  }

  throw Error(`${message} condition failed after ${maxRetries} retries.`);
};
