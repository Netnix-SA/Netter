import { client } from "./state";

export async function addToDo(title: string, url: string) {
    await client.api.users.me.todos.post({ title, url });
}

export async function addPinned(id: string) {
    await client.api.users.me.pins.post({ id });
}