import { server } from "./src/api";

console.log("Starting Netter API server!");

Bun.serve({
    port: 80,
    fetch: server.fetch,
});