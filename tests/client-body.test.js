import test from "node:test";
import assert from "node:assert/strict";

import { createClient } from "../src/index.js";

test("automatically serializes JSON request bodies", async () => {
  const originalFetch = globalThis.fetch;
  let capturedOptions;

  globalThis.fetch = async (url, options) => {
    capturedOptions = options;

    return new Response(
      JSON.stringify({
        id: 1,
        name: "Deepak"
      }),
      {
        status: 201,
        headers: {
          "content-type": "application/json"
        }
      }
    );
  };

  try {
    const api = createClient();

    const response = await api.post(
      "https://example.com/users",
      {
        body: {
          name: "Deepak"
        }
      }
    );

    assert.equal(
      capturedOptions.body,
      JSON.stringify({ name: "Deepak" })
    );

    assert.equal(
      new Headers(capturedOptions.headers).get("content-type"),
      "application/json"
    );

    assert.equal(response.status, 201);

    assert.deepEqual(response.data, {
      id: 1,
      name: "Deepak"
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});