export const jsonFetcher = async (/** @type {string} */ url) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const req = new Request(url, { headers, method: "GET" });
  const res = await fetch(req);
  const json = await res.json();
  return json;
};

/**
 * @param {string} url
 * @param {string} userId
 */
export const authorizedJsonFetcher = async (url, userId) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("X-App-Userid", userId);

  const req = new Request(url, { headers, method: "GET" });
  const res = await fetch(req);
  const json = await res.json();
  return json;
};
