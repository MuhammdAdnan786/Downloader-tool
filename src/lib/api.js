export async function parseJsonBody(request) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return { error: "Content-Type must be application/json." };
  }

  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { error: "Request body must be a JSON object." };
    }
    return { body };
  } catch {
    return { error: "Request body contains invalid JSON." };
  }
}

export async function parseApiResponse(response, fallbackMessage) {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response. Please try again.");
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("The server returned an invalid response. Please try again.");
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || fallbackMessage);
  }

  return data;
}

export function publicMediaError(error, fallbackMessage) {
  const message = String(error?.message || "");

  if (error?.code === 127 || error?.code === "ENOENT" || error?.code === "EACCES") {
    return "The YouTube extraction process could not start on this server. Please try again later.";
  }
  if (/timeout|timed out|etimedout/i.test(message)) {
    return "The video platform took too long to respond. Please try again.";
  }
  if (/private|video unavailable|not available|age.?restricted|login required/i.test(message)) {
    return "This video is private, restricted, or no longer available.";
  }
  if (/yt-dlp is not installed|not available on this server/i.test(message)) {
    return "The video service is not configured correctly on this host.";
  }

  return fallbackMessage;
}