import type { WorkflowContext } from "../type";

/**
 * Replaces variables in a string with values from the context.
 * Variables are in the format: {{variableName.path.to.value}}
 * Example: {{users.httpResponse.data.userId}}
 */
export function replaceVariables(
  str: string,
  context: WorkflowContext
): string {
  // Match {{variable.path.to.value}} pattern
  const variableRegex = /\{\{([^}]+)\}\}/g;

  return str.replace(variableRegex, (match, path) => {
    const trimmedPath = path.trim();
    const value = getNestedValue(context, trimmedPath);
    
    if (value === undefined || value === null) {
      // If variable not found, log for debugging and return the original match
      console.warn(`Variable not found: ${trimmedPath}`, {
        availableKeys: Object.keys(context),
        context: JSON.stringify(context, null, 2).substring(0, 500),
      });
      return match;
    }
    
    // Convert to string, handling objects/arrays
    // For primitives, return as string; for objects/arrays, stringify
    if (typeof value === "string") {
      return value;
    } else if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    } else {
      // For objects/arrays, stringify but don't add quotes if it's already a string representation
      return JSON.stringify(value);
    }
  });
}

/**
 * Gets a nested value from an object using dot notation and bracket notation
 * Examples:
 * - getNestedValue({users: {httpResponse: {data: {userId: 123}}}}, "users.httpResponse.data.userId") => 123
 * - getNestedValue({users: {httpResponse: {data: [{id: 1}]}}}, "users.httpResponse.data[0].id") => 1
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") {
    return undefined;
  }

  // Parse path to handle both dot notation and bracket notation
  // Split by dots, but also handle brackets like [0] or ['key']
  const parts: Array<string | number> = [];
  let currentPart = "";
  let i = 0;

  while (i < path.length) {
    const char = path[i];

    if (char === "[") {
      // Save current part if any
      if (currentPart) {
        parts.push(currentPart);
        currentPart = "";
      }

      // Find the closing bracket
      i++; // Skip '['
      let bracketContent = "";
      while (i < path.length && path[i] !== "]") {
        bracketContent += path[i];
        i++;
      }

      if (i < path.length) {
        // Remove quotes if present
        bracketContent = bracketContent.replace(/^['"]|['"]$/g, "");
        // Try to parse as number, otherwise use as string key
        const index = parseInt(bracketContent, 10);
        parts.push(isNaN(index) ? bracketContent : index);
        i++; // Skip ']'
      }
    } else if (char === ".") {
      // Save current part
      if (currentPart) {
        parts.push(currentPart);
        currentPart = "";
      }
      i++;
    } else {
      currentPart += char;
      i++;
    }
  }

  // Add remaining part
  if (currentPart) {
    parts.push(currentPart);
  }

  // Navigate through the object using the parsed parts
  let current: unknown = obj;

  for (const part of parts) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }

    if (Array.isArray(current)) {
      // For arrays, use numeric index
      if (typeof part === "number") {
        current = current[part];
      } else {
        // Try to parse string part as number
        const index = parseInt(String(part), 10);
        if (isNaN(index)) {
          return undefined;
        }
        current = current[index];
      }
    } else {
      // For objects, access by key (convert number to string for object keys)
      const key = typeof part === "number" ? String(part) : String(part);
      current = (current as Record<string, unknown>)[key];
    }
  }

  return current;
}

/**
 * Generates a default variable name based on node ID or index
 */
export function generateVariableName(nodeId: string, index?: number): string {
  // Use index if provided, otherwise use a sanitized version of nodeId
  if (index !== undefined) {
    return `httpRequest${index + 1}`;
  }
  // Extract a short identifier from nodeId
  const shortId = nodeId.slice(0, 8);
  return `httpRequest_${shortId}`;
}

