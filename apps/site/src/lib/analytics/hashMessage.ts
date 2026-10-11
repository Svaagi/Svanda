const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const HEX_RADIX = 16;
const HASH_HEX_LENGTH = 8;

// 32-bit FNV-1a of the text as 8 hex digits: the same error always reports the same hash,
// while the message itself (which may quote user input) never leaves the browser.
export function hashMessage(message: string): string {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < message.length; i++) {
    hash ^= message.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }

  return (hash >>> 0).toString(HEX_RADIX).padStart(HASH_HEX_LENGTH, '0');
}
