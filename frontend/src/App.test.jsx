import { describe, it, expect } from 'vitest';
import { validatePassword, PASSWORD_RULES } from './utils/validators';

describe('Password Validation', () => {
  it('rejects empty password', () => {
    expect(validatePassword('')).toBe(false);
  });

  it('rejects short password without special chars', () => {
    expect(validatePassword('abc')).toBe(false);
  });

  it('rejects password without uppercase', () => {
    expect(validatePassword('abcdefg1!')).toBe(false);
  });

  it('rejects password without special character', () => {
    expect(validatePassword('Abcdefg1')).toBe(false);
  });

  it('accepts strong password', () => {
    expect(validatePassword('MyP@ssw0rd')).toBe(true);
  });

  it('has 5 validation rules', () => {
    expect(PASSWORD_RULES).toHaveLength(5);
  });
});
