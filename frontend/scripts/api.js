/* ============================================================
   RSTUF TUF Metadata Visualizer — API Client
   ============================================================ */

const API_BASE = window.location.origin;

/**
 * Internal fetch wrapper with timeout and error handling.
 * @param {string} url
 * @param {number} timeoutMs
 * @returns {Promise<Object>}
 */
async function apiFetch(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new ApiError(
        `Server returned ${response.status}: ${response.statusText}`,
        response.status,
        errorBody
      );
    }

    return await response.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;

    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. The server may be unreachable.', 0);
    }

    throw new ApiError(
      `Network error: ${err.message || 'Could not connect to the server.'}`,
      0
    );
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Custom error class for API errors.
 */
class ApiError extends Error {
  constructor(message, statusCode = 0, body = '') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.body = body;
  }
}

/**
 * Fetch the metadata overview (all roles summary).
 * GET /api/metadata/overview
 * @returns {Promise<Object>} Overview data
 */
async function fetchOverview() {
  return apiFetch(`${API_BASE}/api/metadata/overview`);
}

/**
 * Fetch detailed metadata for a specific role.
 * GET /api/metadata/details?role=<roleName>
 * @param {string} role - Role name (e.g. "root", "targets", "bins-0")
 * @returns {Promise<Object>} Role detail data
 */
async function fetchDetails(role) {
  const encodedRole = encodeURIComponent(role);
  return apiFetch(`${API_BASE}/api/metadata/details?role=${encodedRole}`);
}

// Export for use by other modules
window.TUFApi = {
  fetchOverview,
  fetchDetails,
  ApiError,
};
