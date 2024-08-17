import type { ToDo } from "@/server/db/types";

export const map = ({ id, title, url, owner, due, done }: ToDo) => ({
    id: id.toString(),
    title, url,
    owner: owner.toString(),
    due, done,
});