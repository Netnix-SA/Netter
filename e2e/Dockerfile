FROM oven/bun:1.1.42

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install
RUN bunx playwright install --with-deps

COPY . .

CMD ["bunx", "playwright", "test"]