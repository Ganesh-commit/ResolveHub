/**
 * Shared helper function to normalize registration numbers across the entire application.
 * Trims leading/trailing whitespace and converts to uppercase.
 */
function normalizeRegNo(regNo) {
  if (!regNo) return '';
  return String(regNo).trim().toUpperCase();
}

module.exports = {
  normalizeRegNo
};
