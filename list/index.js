/**
 * List keys in Cloudflare KV
 * Use a "url" query string to check for existence of a cached result for a given URL
 * If no "url" query string is provided, list all keys
 *
 * @async
 * @function
 * @param {Request} request - The incoming request data
 * @returns {Response} - Returns array of objects as name + key: ({ name: StringValue })
 */
async function handleRequest(request) {
  if (request.method === "GET") {
    // START timer
    let timeStart = Date.now();

    const URL = getUrl(request.url);
    const prefix = URL !== null ? hash(URL) : null;
    let responseData = await API_CACHE.list({ prefix });

    // END timer
    let timeEnd = Date.now();
    console.log("Call took", timeEnd - timeStart, "ms");

    return new Response(JSON.stringify(responseData.keys), headers(200));
  }

  return new Response("Unallowed HTTP method!", headers(405));
}

const headers = (status = 200) => {
  return {
    headers: {
      "Content-Type": "application/json",
      status
    }
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

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});
