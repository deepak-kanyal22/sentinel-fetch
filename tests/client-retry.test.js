
import test from "node:test";
import assert from "node:assert/strict";

import { createClient } from "../src/index.js";

test("automatically retries network failures", async () => {
  const originalFetch = globalThis.fetch;
  let attempts = 0;

  globalThis.fetch = async () => {
    attempts++;

    if (attempts <= 2) {
      throw new TypeError("Temporary network failure");
    }

    return new Response(
      JSON.stringify({ message: "Success!" }),
      {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      }
    );
  };

  try {
    const api = createClient({
      retries: 2,
      retryDelay: 1
    });

    const response = await api.get(
      "https://example.com/test"
    );

    assert.equal(attempts, 3);
    assert.equal(response.status, 200);
    assert.deepEqual(response.data, {
      message: "Success!"
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("does not retry HTTP errors", async () => {
  const originalFetch = globalThis.fetch;
  let attempts = 0;

  globalThis.fetch = async () => {
    attempts++;

    return new Response(
      JSON.stringify({ message: "Not Found" }),
      {
        status: 404,
        statusText: "Not Found",
        headers: {
          "content-type": "application/json"
        }
      }
    );
  };

  try {
    const api = createClient({
      retries: 3,
      retryDelay: 1
    });

    await assert.rejects(
      api.get("https://example.com/missing"),
      { name: "HTTPError" }
    );

    assert.equal(attempts, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects negative retry counts", async () => {
  const api = createClient({ retries: -1 });

  await assert.rejects(
    api.get("https://example.com"),
    RangeError
  );
});

test("rejects fractional retry counts", async () => {
  const api = createClient({ retries: 2.5 });

  await assert.rejects(
    api.get("https://example.com"),
    RangeError
  );
});

test("rejects negative retry delays", async () => {
  const api = createClient({ retryDelay: -100 });

  await assert.rejects(
    api.get("https://example.com"),
    RangeError
  );
});

test("rejects negative maximum retry delays", async () => {
  const api = createClient({ maxRetryDelay: -100 });

  await assert.rejects(
    api.get("https://example.com"),
    RangeError
  );
});