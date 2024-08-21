import { Bug, CalendarDays, CalendarFold, Circle, CircleArrowUp, CircleCheck, CircleHelp, CircleX, Clock3, Component, Copy, DiamondPlus, Flag, Gift, GitBranch, GitPullRequestArrow, Hourglass, Inbox, MessagesSquare, Notebook, OctagonAlert, SignalHigh, SignalLow, SignalMedium, SquareCheckBig, SquareX, Sunset, Timer, User, Users, View, Wifi, WifiHigh, WifiLow, WifiZero } from "lucide-svelte";
import type { Component } from "svelte";
import type { Efforts, Priorities, State, Value } from "./types";

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

export const PRIORITIES_ICONS = {
    "Low": WifiZero,
    "Medium": WifiLow,
    "High": WifiHigh,
    "Urgent": Wifi,
};

export const PRIORITIES: SelectEntry<Priorities>[] = [
    {
        value: "Low",
        label: "Low",
        icon: PRIORITIES_ICONS["Low"],
    },
    {
        value: "Medium",
        label: "Medium",
        icon: PRIORITIES_ICONS["Medium"],
    },
    {
        value: "High",
        label: "High",
        icon: PRIORITIES_ICONS["High"],
    },
    {
        value: "Urgent",
        label: "Urgent",
        icon: PRIORITIES_ICONS["Urgent"],
    },
];

export const VALUES_ICONS = {
    "Low": SignalLow,
    "Medium": SignalMedium,
    "High": SignalHigh,
};

export const VALUES: SelectEntry<Value>[] = [
    {
        value: "Low",
        label: "Low",
        icon: VALUES_ICONS["Low"],
    },
    {
        value: "Medium",
        label: "Medium",
        icon: VALUES_ICONS["Medium"],
    },
    {
        value: "High",
        label: "High",
        icon: VALUES_ICONS["High"],
    },
];

export const EFFORTS_ICONS = {
    "Hour": Hourglass,
    "Hours": Clock3,
    "Day": Sunset,
    "Days": CalendarDays,
    "Week": CalendarFold,
};

export const EFFORTS: SelectEntry<Efforts>[] = [
    {
        value: "Hour", label: "Hour",
        icon: EFFORTS_ICONS["Hour"],
    },
    {
        value: "Hours", label: "Hours",
        icon: EFFORTS_ICONS["Hours"],
    },
    {
        value: "Day", label: "Day",
        icon: EFFORTS_ICONS["Day"],
    },
    {
        value: "Days", label: "Days",
        icon: EFFORTS_ICONS["Days"],
    },
    {
        value: "Week", label: "Week",
        icon: EFFORTS_ICONS["Week"],
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
    "Feature": DiamondPlus,
    "Application": Component,
    "Bug": Bug,
	"Objective": Flag,
};

export const CLASSES = {
    "Task": {
        icon: CLASS_TO_ICON["Task"],
        url: "/tasks",        
    }
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

export const COLORS = [
    {
        name: "Green/Light",
    },
    {
        name: "Orange/Light",
    },
];