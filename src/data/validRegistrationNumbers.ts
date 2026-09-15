// All college students can create an account using their registration number.
// Registration numbers are verified by Admin before activation.

export const isValidRegistrationNumber = (regNo: string): boolean => {
  if (!regNo) return false;
  const cleaned = regNo.trim().toUpperCase();
  // Valid registration number format check (at least 3 characters, alphanumeric)
  return /^[A-Z0-9_-]{3,20}$/i.test(cleaned);
};

