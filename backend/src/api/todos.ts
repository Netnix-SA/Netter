import type { ToDo } from "../db/types";

export const map = ({ id, title, owner, due, done }: ToDo) => ({
    id: id.toString(),
    title,
    owner: owner.toString(),
    due, done,
});