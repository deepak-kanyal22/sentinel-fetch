
import {
  TimeoutError,
  HTTPError,
  NetworkError
} from "./errors.js";

import {
  shouldRetry,
  getRetryDelay
} from "./retry.js";

import { createTimeout } from "./timeout.js";

export function createClient(config = {}) {
  const {
    baseURL = "",
    headers = {},
    timeout: defaultTimeout,
    retries: defaultRetries = 0,
    retryDelay: defaultRetryDelay = 500,
    maxRetryDelay: defaultMaxRetryDelay = 10000
  } = config;

  async function request(method, url, options = {}) {
    const {
      timeout: requestTimeout,
      signal: externalSignal,
      retries: requestRetries,
      retryDelay: requestRetryDelay,
      maxRetryDelay: requestMaxRetryDelay,
      ...fetchOptions
    } = options;

    const effectiveTimeout = requestTimeout ?? defaultTimeout;

    const maxRetries = requestRetries ?? defaultRetries;
const baseDelay = requestRetryDelay ?? defaultRetryDelay;
const maxDelay = requestMaxRetryDelay ?? defaultMaxRetryDelay;

if (!Number.isInteger(maxRetries) || maxRetries < 0) {
  throw new RangeError("Retries must be a non-negative integer.");
}

if (!Number.isFinite(baseDelay) || baseDelay < 0) {
  throw new RangeError("Retry delay must be a non-negative number.");
}

if (!Number.isFinite(maxDelay) || maxDelay < 0) {
  throw new RangeError("Maximum retry delay must be a non-negative number.");
}

    const requestURL = baseURL
      ? new URL(url, baseURL).toString()
      : url;

    let requestBody = fetchOptions.body;

const requestHeaders = new Headers(headers);

if (fetchOptions.headers) {
  new Headers(fetchOptions.headers).forEach((value, key) => {
    requestHeaders.set(key, value);
  });
}

const isJSONBody =
  requestBody !== null &&
  typeof requestBody === "object" &&
  (
    Array.isArray(requestBody) ||
    Object.getPrototypeOf(requestBody) === Object.prototype
  );

if (isJSONBody) {
  requestBody = JSON.stringify(requestBody);

  if (!requestHeaders.has("content-type")) {
    requestHeaders.set(
      "Content-Type",
      "application/json"
    );
  }
}  

    const retryableMethod = [
      "GET",
      "HEAD",
      "OPTIONS",
      "PUT",
      "DELETE"
    ].includes(method.toUpperCase());

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const timeoutState = createTimeout(
        effectiveTimeout,
        externalSignal
      );

      let retryError;

      try {
        const response = await fetch(requestURL, {
  ...fetchOptions,
  method,
  body: requestBody,
  signal: timeoutState.signal,
  headers: requestHeaders
});

        const contentType =
          response.headers.get("content-type") || "";

        const data = contentType.includes("application/json")
          ? await response.json()
          : await response.text();

        const result = {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          ok: response.ok
        };

        if (!response.ok) {
          throw new HTTPError(result);
        }

        return result;

      } catch (error) {
        let finalError = error;

        if (timeoutState.didTimeout()) {
          finalError = new TimeoutError(effectiveTimeout, {
            cause: error
          });
        } else if (error instanceof TypeError) {
          finalError = new NetworkError(requestURL, {
            cause: error
          });
        }

        const canRetry =
          retryableMethod &&
          shouldRetry(finalError, attempt, maxRetries);

        if (!canRetry) {
          throw finalError;
        }

        retryError = finalError;

      } finally {
        timeoutState.cleanup();
      }

      if (retryError) {
        const delay = getRetryDelay(
          attempt,
          baseDelay,
          maxDelay
        );

        console.log(
          `Retrying request (${attempt + 1}/${maxRetries}) in ${delay} ms...`
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return {
    request,
    get: (url, options) => request("GET", url, options),
    post: (url, options) => request("POST", url, options),
    put: (url, options) => request("PUT", url, options),
    patch: (url, options) => request("PATCH", url, options),
    delete: (url, options) => request("DELETE", url, options)
  };
}
