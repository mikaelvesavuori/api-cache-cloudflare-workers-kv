/**
 * Get cached result for a given URL (in query string)
 * If cache key is empty, do a proxy request and fill cache key with the expected data
 * Return cached or new content to user
 *
 * @async
 * @function
 * @param {Request} request - The incoming request data
 * @returns {Response} - Return cached or fetched data to user
 */
async function handleRequest(request) {
  // Check for API key
  const API_KEY = request.headers.get("x-api-key");
  if (!API_KEY) return new Response("No API key provided!", headers(401));

  // Check for URL query string
  const _URL = request.url ? request.url.split("?url=")[1] : null;
  if (!_URL) return new Response("No URL query string provided!", headers(400));
  const URL = parseSanitizedString(_URL);

  if (request.method === "GET") {
    // START timer
    let timeStart = Date.now();

    const HASH_KEY = hash(URL);
    console.log(`Retrieving cached data for hash key ${HASH_KEY}`);

    let responseData = await API_CACHE.get(HASH_KEY);
    if (!responseData) responseData = await getData(URL, HASH_KEY, API_KEY);

    // END timer
    let timeEnd = Date.now();
    console.log("Call took", timeEnd - timeStart, "ms");

    return new Response(JSON.stringify(responseData), headers(200));
  }

  return new Response("Unallowed HTTP method!", headers(405));
}

const headers = (status = 200) => {
  return {
    "Content-Type": "application/json",
    status
  };
};

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

async function getData(url, hashKey, apiKey) {
  const HEADERS = {
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    method: "GET"
  };

  responseData = await fetch(url, HEADERS).then(res => res.json());
  await cacheData(hashKey, responseData);
  return responseData;
}

async function cacheData(key, data) {
  const TTL = 60; // Seconds from now
  await API_CACHE.put(key, JSON.stringify(data), { expirationTtl: TTL });
  console.log(`Finished putting new data in cache at key ${key}`);
}

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});
