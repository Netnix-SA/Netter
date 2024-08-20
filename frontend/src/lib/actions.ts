import { client } from "./state";

export async function addToDo(title: string) {
    await client.api.users.me.todos.post({ title });
}

export async function addPinned(id: string) {
    await client.api.users.me.pins.post({ id });
}

export async function removePinned(id: string) {
    await client.api.users.me.pins.delete({ id });
}