import { CalendarDays, CalendarFold, Circle, CircleArrowUp, CircleCheck, CircleHelp, CircleX, Clock3, Gift, GitPullRequestArrow, Hourglass, Inbox, MessagesSquare, Notebook, OctagonAlert, SignalHigh, SignalLow, SignalMedium, Sunset, Timer, View } from "lucide-svelte";
import type { Component } from "svelte";
import type { Efforts, Priorities, State } from "./server/db/types";

export type SelectEntry<T> = {
    label: string;
    value: T;
    icon: Component<{}>;
};

export const STATES: SelectEntry<State>[] = [
    {
        value: "Backlog",
        label: "Backlog",
        icon: CircleHelp,
    },
    {
        value: "Alive",
        label: "Alive",
        icon: CircleArrowUp,
    },
    {
        value: "Resolved",
        label: "Resolved",
        icon: CircleCheck,
    },
];

export const PRIORITIES: SelectEntry<Priorities>[] = [
    {
        value: "Low",
        label: "Low",
        icon: SignalLow,
    },
    {
        value: "Medium",
        label: "Medium",
        icon: SignalMedium,
    },
    {
        value: "High",
        label: "High",
        icon: SignalHigh,
    },
    {
        value: "Urgent",
        label: "Urgent",
        icon: OctagonAlert,
    },
];

export const EFFORTS: SelectEntry<Efforts>[] = [
    {
        value: "Hour",
        label: "Hour",
        icon: Hourglass,
    },
    {
        value: "Hours",
        label: "Hours",
        icon: Clock3,
    },
    {
        value: "Day",
        label: "Day",
        icon: Sunset,
    },
    {
        value: "Days",
        label: "Days",
        icon: CalendarDays,
    },
    {
        value: "Week",
        label: "Week",
        icon: CalendarFold,
    },
];

export const LINKS = [
    { href: "/", icon: Inbox, label: "Inbox" },
    { href: "/channels", icon: MessagesSquare, label: "Channels" },
    { href: "/projects", icon: Notebook, label: "Projects" },
    { href: "/products", icon: Gift, label: "Products" },
    { href: "/views", icon: View, label: "Views" },
    { href: "/merge-requests", icon: GitPullRequestArrow, label: "Merge Requests" },
];