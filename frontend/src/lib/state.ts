import { treaty } from "@elysiajs/eden";
import { writable } from "svelte/store";
import type { App } from "../../../backend/src/api";

export const client = treaty<App>('localhost', { fetch: { credentials: 'include' } });

export const commands = writable<{ name: string, commands: { name: string, key?: string, do: () => void }[] }[]>([]);
