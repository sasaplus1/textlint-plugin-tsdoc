/**
 * filter out nullable
 *
 * @param value - any value
 * @returns return true if value is not null or undefined
 */
export function isNonNullable<T>(
  value: T | null | undefined
): value is NonNullable<T> {
  return value !== null && value !== undefined;
}
