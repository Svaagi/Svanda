# Build from the repo root: docker build -f apps/contact-api/Dockerfile .
# The image needs the workspace because the API depends on packages/shared.

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/contact-api/package.json apps/contact-api/
RUN pnpm install --frozen-lockfile --filter @svanda/contact-api...
COPY packages/shared packages/shared
COPY apps/contact-api apps/contact-api
RUN pnpm --filter @svanda/contact-api... build

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/contact-api/package.json apps/contact-api/
RUN pnpm install --frozen-lockfile --prod --filter @svanda/contact-api...

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps --chown=node:node /app/node_modules node_modules
COPY --from=prod-deps --chown=node:node /app/packages/shared/node_modules packages/shared/node_modules
COPY --from=prod-deps --chown=node:node /app/apps/contact-api/node_modules apps/contact-api/node_modules
COPY --from=build --chown=node:node /app/packages/shared/package.json packages/shared/
COPY --from=build --chown=node:node /app/packages/shared/dist packages/shared/dist
COPY --from=build --chown=node:node /app/apps/contact-api/package.json apps/contact-api/
COPY --from=build --chown=node:node /app/apps/contact-api/dist apps/contact-api/dist
USER node
WORKDIR /app/apps/contact-api
EXPOSE 8787
CMD ["node", "dist/index.js"]
