import test from "node:test";
import assert from "node:assert/strict";

import {
  shouldRetry,
  getRetryDelay
} from "../src/retry.js";
import {
  NetworkError,
  TimeoutError,
  HTTPError
} from "../src/errors.js";

test("retries network errors", () => {
  const error = new NetworkError("https://example.com");

  assert.equal(shouldRetry(error, 0, 3), true);
});

test("retries timeout errors", () => {
  const error = new TimeoutError(2000);

  assert.equal(shouldRetry(error, 0, 3), true);
});

test("does not retry HTTP errors", () => {
  const error = new HTTPError({
    status: 404,
    statusText: "Not Found"
  });

  assert.equal(shouldRetry(error, 0, 3), false);
});

test("stops retrying after the maximum", () => {
  const error = new NetworkError("https://example.com");

  assert.equal(shouldRetry(error, 3, 3), false);
});

test("calculates exponential retry delays", () => {
  assert.equal(getRetryDelay(0, 500), 500);
  assert.equal(getRetryDelay(1, 500), 1000);
  assert.equal(getRetryDelay(2, 500), 2000);
  assert.equal(getRetryDelay(3, 500), 4000);
});

test("does not exceed maximum retry delay", () => {
  assert.equal(getRetryDelay(10, 500, 5000), 5000);
});