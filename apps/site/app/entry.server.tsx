import { PassThrough } from 'node:stream';

import { createReadableStreamFromReadable } from '@react-router/node';
import { renderToPipeableStream } from 'react-dom/server';
import { type EntryContext, ServerRouter } from 'react-router';

// The server only runs at build time, to prerender every route. It waits for all content
// (onAllReady) so the prerendered HTML needs no streamed reveal script, which would delay
// hydration.
const RENDER_TIMEOUT_MS = 10_000;
const SERVER_ERROR_STATUS = 500;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  return new Promise<Response>((resolve, reject) => {
    let statusCode = responseStatusCode;
    const timeout: { id?: ReturnType<typeof setTimeout> } = {};

    const stream = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        onAllReady() {
          clearTimeout(timeout.id);
          const body = new PassThrough();
          responseHeaders.set('Content-Type', 'text/html');
          stream.pipe(body);
          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: statusCode,
            }),
          );
        },
        onShellError(error: unknown) {
          clearTimeout(timeout.id);
          reject(error);
        },
        // A failed boundary would prerender its fallback; a non-200 status fails the build.
        onError(error: unknown) {
          // Build-time output only: the prerender step prints why a route failed.
          // eslint-disable-next-line no-console
          console.error(error);
          statusCode = SERVER_ERROR_STATUS;
        },
      },
    );
    timeout.id = setTimeout(stream.abort, RENDER_TIMEOUT_MS);
  });
}
