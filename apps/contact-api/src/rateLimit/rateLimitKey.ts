import { isIPv4, isIPv6 } from 'node:net';

const IPV4_MAPPED_PATTERN = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i;
const IPV6_HEXTETS = 8;
const IPV6_PREFIX_HEXTETS = 4;
const HEX_RADIX = 16;
const IPV4_TAIL_HEXTETS = 2;

// An embedded dotted IPv4 tail (::1.2.3.4) fills two hextets.
const hextetCount = (parts: string[]) =>
  parts.reduce(
    (count, part) => count + (part.includes('.') ? IPV4_TAIL_HEXTETS : 1),
    0,
  );

function expandIpv6(address: string): string[] {
  const [head = '', tail] = address.split('::');
  const headParts = head ? head.split(':') : [];

  if (tail === undefined) return headParts;

  const tailParts = tail ? tail.split(':') : [];
  const missing =
    IPV6_HEXTETS - hextetCount(headParts) - hextetCount(tailParts);

  return [...headParts, ...Array<string>(missing).fill('0'), ...tailParts];
}

const normaliseHextet = (hextet: string) =>
  parseInt(hextet, HEX_RADIX).toString(HEX_RADIX);

// One client usually owns a whole IPv6 /64, so limiting single IPv6 addresses would let it
// rotate through billions of keys. IPv4-mapped IPv6 is the same client as its IPv4 address.
export function toRateLimitKey(ip: string): string {
  const address = ip.split('%')[0] ?? ip;
  const mappedIpv4 = IPV4_MAPPED_PATTERN.exec(address)?.[1];

  if (mappedIpv4 && isIPv4(mappedIpv4)) return mappedIpv4;
  if (!isIPv6(address)) return address;

  const prefix = expandIpv6(address)
    .slice(0, IPV6_PREFIX_HEXTETS)
    .map(normaliseHextet);

  return `${prefix.join(':')}::/64`;
}
