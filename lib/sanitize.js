/**
 * Sanitizes JSON input by converting triple-quoted strings to properly escaped JSON strings
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized JSON string
 */
const stripLineComments = (input) => {
  let result = "";
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      result += char;
      if (inString) escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    if (!inString && char === "/" && next === "/") {
      while (i < input.length && input[i] !== "\n") i += 1;
      if (i < input.length) result += "\n";
      continue;
    }

    result += char;
  }

  return result;
};

export const sanitizeJsonInput = (input) => {
  const jsonStartIndex = input.indexOf("{");
  if (jsonStartIndex > 0) input = input.slice(jsonStartIndex);

  // Convert triple-quoted strings to properly escaped JSON strings
  input = input.replace(
    /"([^"]+)"\s*:\s*"""(.*?)"""/gs,
    (match, key, content) => {
      // Escape the content for JSON
      const escapedContent = content
        .replace(/\\/g, "\\\\") // Escape backslashes
        .replace(/"/g, '\\"') // Escape quotes
        .replace(/\n/g, "\\n") // Escape newlines
        .replace(/\r/g, "\\r") // Escape carriage returns
        .replace(/\t/g, "\\t"); // Escape tabs

      return `"${key}": "${escapedContent}"`;
    }
  );

  input = stripLineComments(input);
  input = input.replace(/\n/g, " ");
  return input;
};
