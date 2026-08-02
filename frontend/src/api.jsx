const normalizeApiLink = (value) => {
  const fallback = "http://10.66.231.89/api/";
  const baseUrl = value || fallback;
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
};

export const API_LINK = normalizeApiLink(
  import.meta.env.VITE_API_LINK ?? import.meta.env.API_LINK,
);

export async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_LINK}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    throw new Error(`Could not reach API at ${API_LINK}${path}: ${error.message}`);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || data?.detail || JSON.stringify(data) || "Request failed",
    );
  }

  return data;
}
