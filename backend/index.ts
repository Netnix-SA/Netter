import { server } from "./src/api";

console.log("Starting Netter API server!");

server.listen(80);

// Bun.serve({
//     port: 80,
//     fetch: server.fetch,
// });