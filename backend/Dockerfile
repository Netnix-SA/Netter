FROM oven/bun:1.1.28 AS base

WORKDIR /usr/src/app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production
COPY . .
ENV NODE_ENV=production

USER bun
EXPOSE 80/tcp
ENV PORT=80
ENTRYPOINT [ "bun", "./index.ts" ]