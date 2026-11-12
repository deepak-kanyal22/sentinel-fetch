export class TimeoutError extends Error {
  constructor(timeout, options = {}) {
    super(
      `Request timed out after ${timeout} ms`,
      options
    );

    this.name = "TimeoutError";
    this.timeout = timeout;
  }
}

export class HTTPError extends Error {
  constructor(response) {
    super(
      `HTTP Error: ${response.status} ${response.statusText}`
    );

    this.name = "HTTPError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = response.data;
    this.headers = response.headers;
  }
}

export class NetworkError extends Error {
  constructor(url, options = {}) {
    super(`Network request failed: ${url}`, options);

    this.name = "NetworkError";
    this.url = url;
  }
}