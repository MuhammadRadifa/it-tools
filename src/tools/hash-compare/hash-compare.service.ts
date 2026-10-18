import type { lib } from 'crypto-js';
import { MD5, RIPEMD160, SHA1, SHA224, SHA256, SHA3, SHA384, SHA512, enc } from 'crypto-js';
import { convertHexToBin } from '../hash-text/hash-text.service';

export const hashAlgorithms = {
  MD5,
  SHA1,
  SHA256,
  SHA224,
  SHA512,
  SHA384,
  SHA3,
  RIPEMD160,
} as const;

export type HashAlgorithmName = keyof typeof hashAlgorithms;
export type HashEncoding = keyof typeof enc | 'Bin';

export function formatHash(hash: lib.WordArray, encoding: HashEncoding): string {
  if (encoding === 'Bin') {
    return convertHexToBin(hash.toString(enc.Hex));
  }

  return hash.toString(enc[encoding]);
}

export function computeHash({ text, algorithm, encoding }: { text: string; algorithm: HashAlgorithmName; encoding: HashEncoding }): string {
  return formatHash(hashAlgorithms[algorithm](text), encoding);
}

function normalizeHash(hash: string, encoding: HashEncoding): string {
  const trimmed = hash.trim();
  return encoding === 'Hex' || encoding === 'Bin' ? trimmed.toLowerCase() : trimmed;
}

export function isHashMatching({
  text,
  expectedHash,
  algorithm,
  encoding,
}: {
  text: string
  expectedHash: string
  algorithm: HashAlgorithmName
  encoding: HashEncoding
}): boolean {
  const computedHash = computeHash({ text, algorithm, encoding });
  return normalizeHash(computedHash, encoding) === normalizeHash(expectedHash, encoding);
}
