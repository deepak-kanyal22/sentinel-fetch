
import {
  createClient,
  NetworkError
} from "../src/index.js";

const api = createClient();

try {
  console.log("Sending request...");

  await api.get("http://localhost:9999/test");

} catch (error) {
  if (error instanceof NetworkError) {
    console.log("Custom network error detected!");
    console.log("Error name:", error.name);
    console.log("Failed URL:", error.url);
    console.log("Message:", error.message);
  } else {
    console.error("Unexpected error:", error);
  }
}

