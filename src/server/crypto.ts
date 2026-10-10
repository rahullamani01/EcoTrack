import crypto from 'node:crypto';

// Use PBKDF2 with SHA-512 with 100,000 iterations and 64-byte salt
const HASH_ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(32).toString('hex');
    crypto.pbkdf2(password, salt, HASH_ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

export function verifyPassword(password: string, combinedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return resolve(false);

    crypto.pbkdf2(password, salt, HASH_ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      const keyBuffer = Buffer.from(key, 'hex');
      if (keyBuffer.length !== derivedKey.length) return resolve(false);
      try {
        resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
      } catch {
        resolve(false);
      }
    });
  });
}

export function generateSecureToken(byteLength: number = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

export function generateSixDigitCode(): string {
  // Cryptographically secure 6-digit code
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

export function isValidPRN(prn: string): boolean {
  if (typeof prn !== 'string') return false;
  const trimmed = prn.trim();
  // SGU Student PRNs are strings of 7 to 10 digits
  return /^[0-9]{7,10}$/.test(trimmed);
}

export function isValidPassword(password: string): boolean {
  if (typeof password !== 'string') return false;
  // Minimum 8 characters, at least 1 letter and 1 number
  return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}
