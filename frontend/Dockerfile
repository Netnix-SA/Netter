FROM oven/bun:1.1.28 AS base

WORKDIR /usr/src/app

FROM base AS dev
COPY package.json bun.lockb ./

FROM dev AS build
RUN bun install --frozen-lockfile
COPY . .
ENV NODE_ENV=production
RUN bun run build

# Using the production dependencies only breaks the build, so this is kept as backup but not used
FROM dev AS pre-release
RUN bun install --frozen-lockfile --production

FROM base AS release
COPY --from=build /usr/src/app/node_modules node_modules
COPY --from=build /usr/src/app/build build
COPY --from=build /usr/src/app/.svelte-kit .svelte-kit

USER bun
EXPOSE 80/tcp
ENV PORT=80
ENTRYPOINT [ "bun", "./build/index.js" ]