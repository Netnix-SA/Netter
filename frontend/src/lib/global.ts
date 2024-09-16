import { Blocks, Bug, CalendarDays, CalendarFold, Circle, CircleArrowUp, CircleCheck, CircleHelp, CircleX, Clock3, Component, Copy, DiamondPlus, Flag, Gift, GitBranch, GitPullRequestArrow, Hourglass, Inbox, MessagesSquare, Notebook, OctagonAlert, Pin, SignalHigh, SignalLow, SignalMedium, SquareCheck, SquareCheckBig, SquareX, Sunset, Timer, Trash, User, Users, View, Wifi, WifiHigh, WifiLow, WifiZero } from "lucide-svelte";
import type { Component } from "svelte";
import type { Efforts, Priorities, State, Value } from "./types";
import { createProductFeatureMutation, deleteFeatureMutation, deleteProductMutation, deleteProjectMutation, deleteTaskMutation, deleteToDoMutation, pinItemMutation } from "./state";
import type { QueryClient } from "@tanstack/svelte-query";
import { task, todo } from "./all.svelte";
import { goto } from "$app/navigation";

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
	"ToDo": SquareCheckBig,
    "Team": Users,
    "Task": Circle,
    "Repository": GitBranch,
    "MergeRequest": GitPullRequestArrow,
    "Feature": DiamondPlus,
    "Application": Component,
    "Bug": Bug,
    "Objective": Flag,
    "Component": Blocks,
};

export const CLASSES = {
	"User": {
        icon: CLASS_TO_ICON["User"],
        url: (id?: string) => id ? `/users/${id}` : "/users",
		actions: [
			{
				label: "Delete",
				icon: Trash,
				action: (queryClient: QueryClient) => deleteTaskMutation(queryClient),
			}
		]
    },
    "Task": {
        icon: CLASS_TO_ICON["Task"],
        url: (id?: string) => id ? `/tasks/${id}` : "/tasks",
		actions: [
			{
				label: "Create related ToDo",
				icon: CLASS_TO_ICON["ToDo"],
				action: (queryClient: QueryClient, id: string) => { todo.value = { related: { id, title: "" } } },
			},
			{
				label: "Pin",
				icon: Pin,
				action: (queryClient: QueryClient, id: string) => pinItemMutation(queryClient)(id),
			},
			{
				label: "Delete",
				icon: Trash,
				action: (queryClient: QueryClient, id: string) => deleteTaskMutation(queryClient)(id),
			}
		],
    },
	"ToDo": {
		icon: CLASS_TO_ICON["ToDo"],
		url: (id?: string) => id ? `/todos/${id}` : "/todos",
		actions: [
			{
				label: "Delete",
				icon: Trash,
				action: (queryClient: QueryClient, id: string) => deleteToDoMutation(queryClient)({ id }),
			}
		],
	},
	"Feature": {
		icon: CLASS_TO_ICON["Feature"],
		url: (id?: string) => id ? `/features/${id}` : "/features",
		actions: [
			{
				label: "Create related ToDo",
				icon: CLASS_TO_ICON["ToDo"],
				action: (queryClient: QueryClient, id: string) => { todo.value = { related: { id, title: "" } } },
			},
			{
				label: "Pin",
				icon: Pin,
				action: (queryClient: QueryClient, id: string) => pinItemMutation(queryClient)(id),
			},
			{
				label: "Delete",
				icon: Trash,
				action: (queryClient: QueryClient, id: string) => deleteFeatureMutation(queryClient)(id),
			}
		],
	},
	"Application": {
		icon: CLASS_TO_ICON["Application"],
		url: (id?: string) => id ? `/applications/${id}` : "/applications",
	},
	"Component": {
		icon: CLASS_TO_ICON["Component"],
		url: (id?: string) => id ? `/components/${id}` : "/components",
		actions: [
			{
				label: "Create related ToDo",
				icon: CLASS_TO_ICON["ToDo"],
				action: (queryClient: QueryClient, id: string) => { todo.value = { related: { id, title: "" } } },
			},
			{
				label: "Pin",
				icon: Pin,
				action: (queryClient: QueryClient, id: string) => pinItemMutation(queryClient)(id),
			},
			// {
			// 	label: "Delete",
			// 	icon: Trash,
			// 	action: (queryClient: QueryClient, id: string) => deleteObjectiveMutation(queryClient)(id),
			// }
		],
	},
	"Bug": {
		icon: CLASS_TO_ICON["Bug"],
		url: (id?: string) => id ? `/bugs/${id}` : "/bugs",
	},
    "Channel": {
    	icon: CLASS_TO_ICON["Channel"],
    	url: (id?: string) => id ? `/channels/${id}` : "/channels",
    },
    "Project": {
    	icon: CLASS_TO_ICON["Project"],
    	url: (id?: string) => id ? `/projects/${id}` : "/projects",
		actions: [
			{
				label: "Tasks",
				icon: CLASS_TO_ICON["Task"],
				action: (queryClient: QueryClient, id: string) => goto(`/projects/${id}/tasks`),
			},
			{
				label: "Objective",
				icon: CLASS_TO_ICON["Objective"],
				action: (queryClient: QueryClient, id: string) => goto(`/projects/${id}/objectives/active`),
			},
			{
				label: "Create related ToDo",
				icon: CLASS_TO_ICON["ToDo"],
				action: (queryClient: QueryClient, id: string) => { todo.value = { related: { id, title: "" } } },
			},
			{
				label: "Pin",
				icon: Pin,
				action: (queryClient: QueryClient, id: string) => pinItemMutation(queryClient)(id),
			},
			{
				label: "Delete",
				icon: Trash,
				action: (queryClient: QueryClient, id: string) => deleteProjectMutation(queryClient)(id),
			}
		],
    },
    "Product": {
    	icon: CLASS_TO_ICON["Product"],
    	url: (id?: string) => id ? `/products/${id}` : "/products",
		actions: [
			{
				label: "Create related ToDo",
				icon: CLASS_TO_ICON["ToDo"],
				action: (queryClient: QueryClient, id: string) => { todo.value = { related: { id, title: "" } } },
			},
			{
				label: "Pin",
				icon: Pin,
				action: (queryClient: QueryClient, id: string) => pinItemMutation(queryClient)(id),
			},
			{
				label: "Create related Feature",
				icon: CLASS_TO_ICON["Feature"],
				action: (queryClient: QueryClient, id: string) => { createProductFeatureMutation(queryClient)({ id }) },
			},
			{
				label: "Delete",
				icon: Trash,
				action: (queryClient: QueryClient, id: string) => deleteProductMutation(queryClient)(id),
			}
		],
    },
    "View": {
    	icon: CLASS_TO_ICON["View"],
    	url: (id?: string) => id ? `/views/${id}` : "/views",
    },
	"Team": {
		icon: CLASS_TO_ICON["Team"],
		url: (id?: string) => id ? `/teams/${id}` : "/teams",
	},
	"Repository": {
		icon: CLASS_TO_ICON["Repository"],
		url: (id?: string) => id ? `/repositories/${id}` : "/repositories",
	},
	"Objective": {
		icon: CLASS_TO_ICON["Objective"],
		url: (id?: string) => id ? `/objectives/${id}` : "/objectives",
		actions: [
			{
				label: "Tasks",
				icon: CLASS_TO_ICON["Task"],
				action: (queryClient: QueryClient, id: string) => goto(`/objectives/${id}/tasks`),
			},
			{
				label: "Create related ToDo",
				icon: CLASS_TO_ICON["ToDo"],
				action: (queryClient: QueryClient, id: string) => { todo.value = { related: { id, title: "" } } },
			},
			{
				label: "Pin",
				icon: Pin,
				action: (queryClient: QueryClient, id: string) => pinItemMutation(queryClient)(id),
			},
			{
				label: "Create related Task",
				icon: CLASS_TO_ICON["Task"],
				action: (queryClient: QueryClient, id: string) => { task.value = { related: [{ id, }] } },
			}
			// {
			// 	label: "Delete",
			// 	icon: Trash,
			// 	action: (queryClient: QueryClient, id: string) => deleteObjectiveMutation(queryClient)(id),
			// }
		],
	},
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
