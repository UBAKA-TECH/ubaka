// Build absolute URL for server-hosted assets like /uploads/... 
// - If input is absolute (http/https), return as-is
// - If input starts with /uploads/, prefix backend origin (strip trailing /api from baseURL)
// - Otherwise return input
export default function assetUrl(path) {
  if (!path) return "";
  // For absolute URLs (like placeholders from cloudinary)
  if (/^https?:\/\//i.test(path)) return path;

  // Normalise backslashes to forward slashes for cross-platform compatibility
  let normalizedPath = path.replace(/\\/g, '/');

  // Handle Windows absolute paths (e.g. D:/Benit/FYP/.../uploads/xxx)
  // Extract only the part starting from uploads/
  const uploadsIndex = normalizedPath.toLowerCase().indexOf('/uploads/');
  if (uploadsIndex !== -1) {
    normalizedPath = normalizedPath.substring(uploadsIndex); // Result: /uploads/xxx
  } else if (normalizedPath.toLowerCase().startsWith('uploads/')) {
    normalizedPath = '/' + normalizedPath;
  }

  // For backend-provided paths
  if (normalizedPath.startsWith("/uploads/")) {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    // Ensure we don't end up with /api/uploads or double slashes
    const origin = apiUrl.replace(/\/api\/?$/, "");
    return `${origin}${normalizedPath}`;
  }

  // For local public paths
  return (process.env.PUBLIC_URL || '') + normalizedPath;
}
