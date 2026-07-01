/**
 * Validates that `value` contains only letters, numbers, and underscores.
 *
 * @param value - String to validate.
 * @returns The original value when valid.
 * @throws When the value contains disallowed characters.
 */
const sanitize = (value: string): string => {
  const regex = new RegExp('^[A-Za-z0-9_]+$');
  const check = regex.test(value);
  if (check) return value;
  throw new Error('Only numbers, letters and underscores allowed');
};

export { sanitize };
