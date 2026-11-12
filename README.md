# SentinelFetch

**Reliable API requests, without repetitive error-handling code.**

SentinelFetch is a lightweight JavaScript HTTP client built on Node.js native Fetch API. It simplifies API communication with automatic retries, timeout management, JSON serialization, and structured error handling.

## Features

- **Lightweight:** Uses native Fetch API with zero runtime dependencies.
- **Automatic Retries:** Retries eligible network failures and timeouts.
- **Exponential Backoff:** Gradually increases the delay between retry attempts.
- **Timeout Management:** Configure request timeouts.
- **Automatic JSON Handling:** Automatically serializes JavaScript objects into JSON.
- **Custom Error Classes:** Handle HTTP, network, and timeout errors separately.
- **Configurable:** Set default options globally or override them per request.
- **Modern JavaScript:** ES Modules support.

## Requirements

- Node.js 18 or higher.

## Installation

```bash
npm install sentinel-fetch
```

## Quick Start

```javascript
import { createClient } from "sentinel-fetch";

const api = createClient({
  baseURL: "https://jsonplaceholder.typicode.com",
  timeout: 5000,
  retries: 2
});

try {
  const response = await api.get("/users/1");

  console.log(response.data);
  console.log(response.status);
} catch (error) {
  console.error("Request failed:", error.message);
}
```

## HTTP Methods

SentinelFetch supports the following HTTP methods:

```javascript
await api.get("/users");

await api.post("/users", {
  body: {
    name: "Deepak",
    email: "deepak@example.com"
  }
});

await api.put("/users/1", {
  body: {
    name: "Updated Name"
  }
});

await api.patch("/users/1", {
  body: {
    name: "New Name"
  }
});

await api.delete("/users/1");
```

## Configuration

Configure your client when creating an instance.

| Option | Default | Description |
|---|---|---|
| `baseURL` | `""` | Base URL for requests |
| `headers` | `{}` | Default request headers |
| `timeout` | `undefined` | Request timeout in milliseconds |
| `retries` | `0` | Maximum retry attempts |
| `retryDelay` | `500` | Initial retry delay in milliseconds |
| `maxRetryDelay` | `10000` | Maximum retry delay in milliseconds |

Example:

```javascript
const api = createClient({
  baseURL: "https://api.example.com",
  timeout: 5000,
  retries: 3,
  retryDelay: 500,
  maxRetryDelay: 10000,
  headers: {
    Authorization: "Bearer YOUR_TOKEN"
  }
});
```

## Request-Level Configuration

Override client defaults for individual requests.

```javascript
const response = await api.get("/users", {
  timeout: 3000,
  retries: 1,
  headers: {
    "X-Custom-Header": "SentinelFetch"
  }
});
```

## Automatic Retry Behavior

SentinelFetch uses exponential backoff to manage retry attempts.

By default, it retries:

- Network failures.
- Request timeouts.

It does not retry HTTP errors or automatically retry non-idempotent methods such as POST and PATCH.

The retry delay follows an exponential backoff strategy, subject to the configured maximum delay.

## Error Handling

SentinelFetch provides three custom error classes:

| Error | Description |
|---|---|
| `NetworkError` | Network request failures |
| `TimeoutError` | Requests that exceed the configured timeout |
| `HTTPError` | Unsuccessful HTTP responses |

Example:

```javascript
import {
  createClient,
  NetworkError,
  TimeoutError,
  HTTPError
} from "sentinel-fetch";

const api = createClient({
  timeout: 3000
});

try {
  const response = await api.get("/users");
  console.log(response.data);

} catch (error) {
  if (error instanceof NetworkError) {
    console.error("Network failure:", error.url);

  } else if (error instanceof TimeoutError) {
    console.error("Request timed out:", error.timeout);

  } else if (error instanceof HTTPError) {
    console.error("HTTP error:", error.status);

  } else {
    console.error("Unexpected error:", error);
  }
}
```

## Response Structure

Successful requests return an object containing:

```javascript
{
  data: {},          // Parsed response body
  status: 200,       // HTTP status code
  statusText: "OK",  // HTTP status text
  headers: Headers,  // Response headers
  ok: true           // Request success status
}
```

## Running Tests

Clone the repository:

```bash
git clone https://github.com/deepak-kanyal22/sentinel-fetch.git
```

Navigate into the project:

```bash
cd sentinel-fetch
```

Run the test suite:

```bash
npm install
npm test
```

## Project Structure

```text
sentinel-fetch/
├── src/
│   ├── client.js
│   ├── errors.js
│   ├── index.js
│   ├── retry.js
│   └── timeout.js
├── tests/
│   ├── client-body.test.js
│   ├── client-retry.test.js
│   └── retry.test.js
├── examples/
│   └── basic.js
├── .gitignore
├── package.json
└── README.md
```

## Contributing

Contributions, bug reports, and feature suggestions are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request.

## License

This project is licensed under the MIT License.

---
