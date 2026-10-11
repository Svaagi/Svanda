import type { ContactErrorCode } from '@svanda/shared';
import type { RequestIdVariables } from 'hono/request-id';

export type AppEnv = {
  Variables: RequestIdVariables & {
    errorCode?: ContactErrorCode;
  };
};
