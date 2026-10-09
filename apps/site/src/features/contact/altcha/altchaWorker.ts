// The browser side of ALTCHA's worker protocol, deriving keys with Web Crypto (the package's
// own worker entries use Node's crypto).
import { deriveKey } from 'altcha-lib/algorithms/web/pbkdf2';
import { handler } from 'altcha-lib/workers/shared';

handler({ deriveKey });
