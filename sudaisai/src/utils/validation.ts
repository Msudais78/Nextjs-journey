import { RE2JS } from 're2js';

// ============================================================
// CONSTANTS — single source of truth for all size limits
// ============================================================

/**
 * Single source of truth for input size limits and security thresholds across the application.
 */
export const INPUT_LIMITS = {
  EMAIL_MAX_LENGTH: 254,      // RFC 5321 maximum
  EMAIL_MIN_LENGTH: 5,
  USERNAME_MAX_LENGTH: 30,
  USERNAME_MIN_LENGTH: 3,
  PASSWORD_MAX_LENGTH: 128,   // Prevent bcrypt DoS (bcrypt truncates at 72 bytes)
  PASSWORD_MIN_LENGTH: 10,
  REQUEST_BODY_MAX_BYTES: 4096, // 4KB max request body
} as const;

// ============================================================
// COMPILED LINEAR-TIME REGEX PATTERNS (RE2JS - Guaranteed O(n))
// ============================================================
// Google RE2 algorithm guarantees linear-time execution, protecting against ReDoS attacks.
const emailLinearRegex = RE2JS.compile('^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$');
const usernameLinearRegex = RE2JS.compile('^[a-zA-Z0-9_-]+$');
const usernameEdgeSpecialRegex = RE2JS.compile('^[-_]|[-_]$');

const lowerCaseRegex = RE2JS.compile('[a-z]');
const upperCaseRegex = RE2JS.compile('[A-Z]');
const digitRegex = RE2JS.compile('\\d');
const specialCharRegex = RE2JS.compile('[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?]');

// ============================================================
// EMAIL VALIDATION
// ============================================================

/**
 * Validates that an input is a correctly formatted email address.
 * 
 * Performs string type check, length bounds check (RFC 5321), linear-time RE2JS regex validation,
 * and structural checks (local part <= 64, domain <= 253, no consecutive dots, no leading/trailing dots).
 * 
 * @param email - Unknown input value to validate as email
 * @returns Type predicate `email is string`, true if valid
 */
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  
  // Size check FIRST to prevent ReDoS
  if (email.length < INPUT_LIMITS.EMAIL_MIN_LENGTH) return false;
  if (email.length > INPUT_LIMITS.EMAIL_MAX_LENGTH) return false;

  // Linear-time RE2JS regex evaluation — immune to catastrophic backtracking / ReDoS
  if (!emailLinearRegex.testExact(email)) return false;

  // Additional structural checks
  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (local.length > 64) return false;        // RFC 5321 local part limit
  if (domain.length > 253) return false;      // RFC 5321 domain limit
  if (domain.includes('..')) return false;    // No consecutive dots
  if (local.startsWith('.') || local.endsWith('.')) return false;

  return true;
}

// ============================================================
// PASSWORD VALIDATION
// ============================================================

/**
 * Detailed password validation response object.
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Type-guard function checking whether a password satisfies all strength criteria.
 * 
 * @param password - Unknown input value to check
 * @returns Type predicate `password is string`, true if all password criteria pass
 */
export function isValidPassword(password: unknown): password is string {
  const result = validatePasswordStrength(password);
  return result.valid;
}

/**
 * Validates password strength against security rules and returns granular error details.
 * 
 * Security rules enforced:
 * - String type check
 * - Maximum length check (<= 128 chars) to prevent bcrypt Denial of Service (DoS)
 * - Minimum length check (>= 10 chars)
 * - Must contain at least one lowercase letter (`[a-z]`)
 * - Must contain at least one uppercase letter (`[A-Z]`)
 * - Must contain at least one numeric digit (`\d`)
 * - Must contain at least one special character
 * - Rejects single-character repetition patterns (e.g. "aaaaaaaaaa") via O(n) string comparison
 * 
 * @param password - Unknown input value to validate
 * @returns `PasswordValidationResult` containing `valid` boolean and `errors` array
 */
export function validatePasswordStrength(
  password: unknown
): PasswordValidationResult {
  const errors: string[] = [];

  if (typeof password !== 'string') {
    return { valid: false, errors: ['Password must be a string.'] };
  }

  // ⚠️ CRITICAL: Check MAX before MIN to prevent bcrypt DoS
  // bcrypt silently truncates at 72 bytes — long passwords seem to work
  // but provide false security. Attackers can also send huge payloads.
  if (password.length > INPUT_LIMITS.PASSWORD_MAX_LENGTH) {
    errors.push(
      `Password must not exceed ${INPUT_LIMITS.PASSWORD_MAX_LENGTH} characters.`
    );
  }

  if (password.length < INPUT_LIMITS.PASSWORD_MIN_LENGTH) {
    errors.push(
      `Password must be at least ${INPUT_LIMITS.PASSWORD_MIN_LENGTH} characters.`
    );
  }

  if (!lowerCaseRegex.test(password)) {
    errors.push('Password must contain at least one lowercase letter.');
  }

  if (!upperCaseRegex.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }

  if (!digitRegex.test(password)) {
    errors.push('Password must contain at least one number.');
  }

  if (!specialCharRegex.test(password)) {
    errors.push('Password must contain at least one special character.');
  }

  // Check for common weak patterns (all same character, e.g. "aaaaaaaaaa")
  // Note: Backreferences like \1 are non-regular and rejected by linear regex engines.
  // We use an O(n) linear string check instead.
  if (password.length > 1 && password.split('').every(c => c === password[0])) {
    errors.push('Password cannot be all the same character.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================
// USERNAME VALIDATION
// ============================================================

/**
 * Validates that a username meets application requirements and security constraints.
 * 
 * Security rules enforced:
 * - String type check
 * - Length check (3 to 30 characters)
 * - Alphanumeric, underscores, and hyphens only (`/^[a-zA-Z0-9_-]+$/`)
 * - Cannot start or end with hyphens or underscores
 * - Explicitly blocks null bytes (`\0`) to prevent injection attacks
 * 
 * @param username - Unknown input value to validate
 * @returns Type predicate `username is string`, true if valid
 */
export function isValidUsername(username: unknown): username is string {
  if (typeof username !== 'string') return false;

  // Size checks first
  if (username.length < INPUT_LIMITS.USERNAME_MIN_LENGTH) return false;
  if (username.length > INPUT_LIMITS.USERNAME_MAX_LENGTH) return false;

  // Linear-time RE2JS regex check — guaranteed O(n)
  if (!usernameLinearRegex.testExact(username)) return false;

  // Cannot start or end with special chars
  if (usernameEdgeSpecialRegex.test(username)) return false;

  // Block null bytes explicitly
  if (username.includes('\0')) return false;

  return true;
}

// ============================================================
// SANITIZATION — strip dangerous characters
// ============================================================

/**
 * Sanitizes user input string by stripping dangerous control characters and trimming whitespace.
 * 
 * Operations performed:
 * - Removes null bytes (`\0`)
 * - Removes ASCII control characters (`[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]`)
 * - Trims leading and trailing whitespace
 * 
 * @param input - The raw input string to sanitize
 * @returns Cleaned and sanitized string
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/\0/g, '')           // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
    .trim();
}

// ============================================================
// SAFE CONSTANT-TIME COMPARISON — prevent timing attacks
// ============================================================

/**
 * Compares two strings in constant-time to prevent timing side-channel attacks.
 * 
 * Useful for comparing API tokens, secret keys, or password hashes where variable-time
 * comparison could leak information about the secret content or length.
 * 
 * @param a - First string
 * @param b - Second string
 * @returns `true` if strings are byte-for-byte identical, `false` otherwise
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still run comparison to prevent timing leak on length
    let result = 1;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    }
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}