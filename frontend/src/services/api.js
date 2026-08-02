// Thin wrapper over the Django REST backend (backend/config/server/urls.py).
//
// Requests go to a relative /api path by default so the Vite dev proxy handles
// them (see vite.config.js). The backend has no CORS middleware installed, so
// calling it cross-origin from the browser will fail — keep it same-origin.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(
  /\/+$/,
  "",
);

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// DRF returns validation errors as {field: ["msg", ...]} and other failures as
// {detail: "msg"}. Flatten either into one readable line.
const messageFromBody = (body, status) => {
  if (!body) return `Request failed (${status})`;
  if (typeof body === "string") return body;
  if (body.detail) return body.detail;
  if (body.error) return body.error;

  const fields = Object.entries(body)
    .map(([field, errors]) =>
      Array.isArray(errors) ? `${field}: ${errors.join(", ")}` : null,
    )
    .filter(Boolean);

  return fields.length ? fields.join(" · ") : `Request failed (${status})`;
};

async function request(path, { method = "GET", body, signal } = {}) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    // Aborts are the caller unmounting, not a failure worth reporting.
    if (error.name === "AbortError") throw error;
    throw new ApiError(
      "Cannot reach the server. Is the backend running?",
      0,
      null,
    );
  }

  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(messageFromBody(data, response.status), response.status, data);
  }

  return data;
}

// List endpoints are unpaginated today, but tolerate DRF turning pagination on.
export const asList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

// Django's URLConf matches on exact trailing slashes, and writes live on
// their own /update/ and /delete/ suffixes rather than the detail route.
const resource = (name) => ({
  list: (options) => request(`/${name}/`, options).then(asList),
  retrieve: (id, options) => request(`/${name}/${id}/`, options),
  create: (body, options) => request(`/${name}/`, { ...options, method: "POST", body }),
  update: (id, body, options) =>
    request(`/${name}/${id}/update/`, { ...options, method: "PATCH", body }),
  replace: (id, body, options) =>
    request(`/${name}/${id}/update/`, { ...options, method: "PUT", body }),
  remove: (id, options) =>
    request(`/${name}/${id}/delete/`, { ...options, method: "DELETE" }),
});

export const api = {
  voters: resource("voters"),
  elections: resource("elections"),
  contracts: resource("contracts"),
  candidates: resource("candidates"),
  positions: resource("positions"),
  votes: {
    ...resource("votes"),
    // The backend exposes no filtering on /votes/, so this pulls the ledger and
    // matches locally. Fine at hackathon scale; needs a real ?vote_txid= filter
    // on the server before this is put in front of a large electorate.
    findByTxid: async (txid, options) => {
      const target = String(txid ?? "").trim().toLowerCase();
      if (!target) return null;
      const votes = await resource("votes").list(options);
      return (
        votes.find(
          (vote) => String(vote.vote_txid ?? "").toLowerCase() === target,
        ) ?? null
      );
    },
  },
  nfts: {
    ...resource("nfts"),
    // Mints a voter NFT per voter per position for the election.
    createVoterNFTs: (electionId, options) =>
      request("/nfts/create-voter-nfts/", {
        ...options,
        method: "POST",
        body: { election_id: electionId },
      }),
  },
};

export default api;
