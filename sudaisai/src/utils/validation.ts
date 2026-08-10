// ============================================================
// CONSTANTS — single source of truth for all size limits
// ============================================================
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
// EMAIL VALIDATION
// ============================================================
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  
  // Size check FIRST to prevent ReDoS
  if (email.length < INPUT_LIMITS.EMAIL_MIN_LENGTH) return false;
  if (email.length > INPUT_LIMITS.EMAIL_MAX_LENGTH) return false;

  // Simple, safe regex — avoid complex patterns vulnerable to ReDoS
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;

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
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function isValidPassword(password: unknown): password is string {
  const result = validatePasswordStrength(password);
  return result.valid;
}

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

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter.');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number.');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character.');
  }

  // Check for common weak patterns
  if (/^(.)\1+$/.test(password)) {
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
export function isValidUsername(username: unknown): username is string {
  if (typeof username !== 'string') return false;

  // Size checks first
  if (username.length < INPUT_LIMITS.USERNAME_MIN_LENGTH) return false;
  if (username.length > INPUT_LIMITS.USERNAME_MAX_LENGTH) return false;

  // Only allow alphanumeric, underscores, hyphens
  // Prevents XSS, SQL injection characters, null bytes
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) return false;

  // Cannot start or end with special chars
  if (/^[-_]|[-_]$/.test(username)) return false;

  // Block null bytes explicitly
  if (username.includes('\0')) return false;

  return true;
}

// ============================================================
// SANITIZATION — strip dangerous characters
// ============================================================
export function sanitizeString(input: string): string {
  return input
    .replace(/\0/g, '')           // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
    .trim();
}

// ============================================================
// SAFE CONSTANT-TIME COMPARISON — prevent timing attacks
// ============================================================
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