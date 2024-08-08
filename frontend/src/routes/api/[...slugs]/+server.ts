import { server } from "@/api";

console.log("Starting Netter backend");

type RequestHandler = (v: { request: Request }) => Response | Promise<Response>;

export const GET: RequestHandler = ({ request }) => server.handle(request);
export const POST: RequestHandler = ({ request}) => server.handle(request);