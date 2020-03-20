/**
 * Delete keys in Cloudflare KV
 * Use a "url" query string to delete cached result for a given URL
 * If no "url" query string is provided, delete all keys
 *
 * @async
 * @function
 * @param {Request} request - The incoming request data
 * @returns {Response} - Returns array of objects ({ name: StringValue })
 */
async function handleRequest(request) {
  // Check for URL query string
  const _URL = request.url ? request.url.split("?url=")[1] : null;
  if (!_URL) return new Response("No URL query string provided!", headers(400));
  const URL = parseSanitizedString(_URL);

  if (request.method === "GET") {
    // START timer
    let timeStart = Date.now();

    const URL = getUrl(request.url);

    // Delete single cache key
    const KEY = hash(URL);
    await API_CACHE.delete(KEY);

    const LIST = await API_CACHE.list();
    console.log(LIST.keys);

    // END timer
    let timeEnd = Date.now();
    console.log("Call took", timeEnd - timeStart, "ms");

    return new Response(JSON.stringify("OK"), headers(200));
  }

  return new Response("Unallowed HTTP method!", headers(405));
}

const headers = (status = 200) => {
  return {
    "Content-Type": "application/json",
    status
  };
};

function getUrl(url) {
  if (url.includes("?url=")) return url.split("?url=")[1];
  return null;
}

// Reference: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
function hash(str) {
  return str.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
}

function parseSanitizedString(str) {
  return str
    .replace(/%3A/gi, ":")
    .replace(/%2F/gi, "/")
    .replace(/%3F/gi, "?")
    .replace(/%3D/gi, "=")
    .replace(/%26/gi, "&")
    .replace(/%5B/gi, "[")
    .replace(/%5D/gi, "]");
}

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});
