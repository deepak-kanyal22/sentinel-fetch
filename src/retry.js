export function shouldRetry(error, attempt, maxRetries) {
  if (attempt >= maxRetries) {
    return false;
  }

  // Never retry unsuccessful HTTP responses.
  if (error.name === "HTTPError") {
    return false;
  }

  // Retry network failures and timeouts.
  if (
    error.name === "NetworkError" ||
    error.name === "TimeoutError"
  ) {
    return true;
  }

  return false;
}

export function getRetryDelay(
  attempt,
  baseDelay = 500,
  maxDelay = 10000
) {
  return Math.min(
    baseDelay * 2 ** attempt,
    maxDelay
  );
}
