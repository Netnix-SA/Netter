import { treaty } from "@elysiajs/eden";
import { writable } from "svelte/store";
import type { App } from "./api";

export const client = treaty<App>('localhost');

export const commands = writable<{ name: string, commands: { name: string, do: () => void }[] }[]>([]);