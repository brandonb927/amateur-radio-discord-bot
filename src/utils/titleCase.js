/**
 * Utility function that applies titlecasing to a given string
 *
 * @param {string} title String to apply titlecase to
 * @returns {string|null}
 */
export function titleCase(title) {
  if (title.length > 0) {
    return title.charAt(0).toUpperCase() + title.slice(1);
  }
  return;
}
