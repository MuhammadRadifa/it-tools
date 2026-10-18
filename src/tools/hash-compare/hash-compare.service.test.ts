import { describe, expect, it } from 'vitest';
import { convertHexToBin } from '../hash-text/hash-text.service';
import { computeHash, isHashMatching } from './hash-compare.service';

describe('hash-compare', () => {
  describe('computeHash', () => {
    it('computes a SHA256 hash in hex', () => {
      expect(computeHash({ text: 'hello', algorithm: 'SHA256', encoding: 'Hex' })).toBe(
        '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
      );
    });

    it('computes an MD5 hash in hex', () => {
      expect(computeHash({ text: 'hello', algorithm: 'MD5', encoding: 'Hex' })).toBe(
        '5d41402abc4b2a76b9719d911017c592',
      );
    });

    it('computes a SHA1 hash in hex', () => {
      expect(computeHash({ text: 'hello', algorithm: 'SHA1', encoding: 'Hex' })).toBe(
        'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d',
      );
    });

    it('computes the hash of an empty text', () => {
      expect(computeHash({ text: '', algorithm: 'MD5', encoding: 'Hex' })).toBe('d41d8cd98f00b204e9800998ecf8427e');
      expect(computeHash({ text: '', algorithm: 'SHA256', encoding: 'Hex' })).toBe(
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      );
    });

    it('formats the digest with the given encoding', () => {
      expect(computeHash({ text: 'hello', algorithm: 'SHA256', encoding: 'Base64' })).toBe(
        'LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=',
      );
      expect(computeHash({ text: 'hello', algorithm: 'SHA256', encoding: 'Base64url' })).toBe(
        'LPJNul-wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ',
      );
      expect(computeHash({ text: 'hello', algorithm: 'SHA256', encoding: 'Bin' })).toBe(
        convertHexToBin('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'),
      );
    });
  });

  describe('isHashMatching', () => {
    it('returns true when the text matches the hash', () => {
      expect(
        isHashMatching({
          text: 'hello',
          expectedHash: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
          algorithm: 'SHA256',
          encoding: 'Hex',
        }),
      ).toBe(true);
    });

    it('ignores case and surrounding whitespace for hex digests', () => {
      expect(
        isHashMatching({
          text: 'hello',
          expectedHash: '  2CF24DBA5FB0A30E26E83B2AC5B9E29E1B161E5C1FA7425E73043362938B9824  ',
          algorithm: 'SHA256',
          encoding: 'Hex',
        }),
      ).toBe(true);
    });

    it('returns false when the text does not match the hash', () => {
      expect(
        isHashMatching({
          text: 'hello world',
          expectedHash: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
          algorithm: 'SHA256',
          encoding: 'Hex',
        }),
      ).toBe(false);
    });

    it('returns false when the algorithm does not match the hash', () => {
      expect(
        isHashMatching({
          text: 'hello',
          expectedHash: '5d41402abc4b2a76b9719d911017c592',
          algorithm: 'SHA256',
          encoding: 'Hex',
        }),
      ).toBe(false);
    });

    it('is case-sensitive for base64 digests', () => {
      expect(
        isHashMatching({
          text: 'hello',
          expectedHash: 'lpjnul+wow4m6dsqxbninhswhlwfp0jecwqzypplmcq=',
          algorithm: 'SHA256',
          encoding: 'Base64',
        }),
      ).toBe(false);
    });
  });
});
