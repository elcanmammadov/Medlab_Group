/**
 * Middleware to parse bracket notation from multipart form data.
 * Converts fields like "name[az]", "name[ru]" into nested objects:
 * { name: { az: "...", ru: "..." } }
 */
const parseNestedFields = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return next();
  }

  const parsed = {};

  for (const [key, value] of Object.entries(req.body)) {
    // Check for bracket notation like "name[az]" or "position[en]"
    const match = key.match(/^([^\[]+)\[([^\]]+)\]$/);

    if (match) {
      const parentKey = match[1];
      const childKey = match[2];

      if (!parsed[parentKey]) {
        parsed[parentKey] = {};
      }
      parsed[parentKey][childKey] = value;
    } else {
      parsed[key] = value;
    }
  }

  req.body = parsed;
  next();
};

module.exports = parseNestedFields;
