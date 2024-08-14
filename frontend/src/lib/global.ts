import { CalendarDays, CalendarFold, Circle, CircleArrowUp, CircleCheck, CircleHelp, CircleX, Clock3, Copy, Gift, GitBranch, GitPullRequestArrow, Hourglass, Inbox, MessagesSquare, Notebook, OctagonAlert, SignalHigh, SignalLow, SignalMedium, SquareCheckBig, SquareX, Sunset, Timer, User, Users, View } from "lucide-svelte";
import type { Component } from "svelte";
import type { Efforts, Priorities, State, Value } from "./server/db/types";

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

export const VALUES: SelectEntry<Value>[] = [
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

export const RESOLUTION_METHODS = [
    { label: "Resolved", value: "Resolved", icon: SquareCheckBig },
    { label: "Duplicate", value: "Duplicate", icon: Copy },
    { label: "Canceled", value: "Canceled", icon: SquareX },
];

export const CLASS_TO_ICON = {
    "User": User,
    "Channel": MessagesSquare,
    "Project": Notebook,
    "Product": Gift,
    "View": View,
    "Team": Users,
    "Task": Circle,
    "Repository": GitBranch,
    "MergeRequest": GitPullRequestArrow,
};

export const LINKS = [
    { href: "/", icon: Inbox, label: "Inbox" },
    { href: "/channels", icon: CLASS_TO_ICON["Channel"], label: "Channels" },
    { href: "/projects", icon: CLASS_TO_ICON["Project"], label: "Projects" },
    { href: "/products", icon: CLASS_TO_ICON["Product"], label: "Products" },
    { href: "/views", icon: CLASS_TO_ICON["View"], label: "Views" },
    { href: "/teams", icon: CLASS_TO_ICON["Team"], label: "Teams" },
    { href: "/repositories", icon: CLASS_TO_ICON["Repository"], label: "Repositories" },
    { href: "/merge-requests", icon: CLASS_TO_ICON["MergeRequest"], label: "Merge Requests" },
];