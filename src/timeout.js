export function createTimeout(timeout, externalSignal) {
  if (timeout === undefined || timeout === null) {
    return {
      signal: externalSignal,
      cleanup() {},
      didTimeout: () => false
    };
  }

  if (!Number.isFinite(timeout) || timeout <= 0) {
    throw new RangeError("Timeout must be a positive number.");
  }

  const controller = new AbortController();

  let timedOut = false;

  const abortFromExternal = () => {
    controller.abort(externalSignal.reason);
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      abortFromExternal();
    } else {
      externalSignal.addEventListener(
        "abort",
        abortFromExternal,
        { once: true }
      );
    }
  }

  const timer = setTimeout(() => {
    timedOut = true;

    controller.abort(
      new DOMException(
        `Request timed out after ${timeout} ms`,
        "TimeoutError"
      )
    );
  }, timeout);

  return {
    signal: controller.signal,

    cleanup() {
      clearTimeout(timer);

      externalSignal?.removeEventListener(
        "abort",
        abortFromExternal
      );
    },

    didTimeout: () => timedOut
  };
}
