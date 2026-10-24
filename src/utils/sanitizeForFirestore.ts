/**
 * Sanitizes JavaScript objects for Cloud Firestore storage.
 * Firestore throws errors on `undefined` field values.
 * This recursively converts undefined to null or removes undefined keys.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }

  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => sanitizeForFirestore(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    // Keep Date objects
    if (data instanceof Date) {
      return data as unknown as T;
    }

    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanObj[key] = sanitizeForFirestore(value);
      }
    }
    return cleanObj as T;
  }

  return data;
}
