import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import type { Colors, LabelFilter, StateFilter, Status, StatusFilter, Task, TextFilter } from "./types";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number]
	) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (
		style: Record<string, number | string | undefined>
	): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, "");
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

export function groupBy<T, K>(list: T[], keyGetter: (arg0: T) => K): Map<K, T[]> {
    const map = new Map();
    list.forEach((item) => {
		const key = keyGetter(item);
		const collection = map.get(key);
		if (!collection) {
			map.set(key, [item]);
		} else {
			collection.push(item);
		}
    });
    return map;
}

export function filterTask(t: Task, filter: StateFilter | StatusFilter | TextFilter | LabelFilter, statuses: Status[]): boolean {
	switch(filter.type) {
		case "State": {
			switch (filter.operation) {
				case '=': { return statuses.find(s => s.id === t.status.id)?.state === filter.value; }
				case '!=': { return statuses.find(s => s.id === t.status.id)?.state !== filter.value; }
				default: { return false; }
			}
		}
		case "Status": {
			switch (filter.operation) {
				case '=': { return t.status.id === filter.value; }
				case '!=': { return t.status.id !== filter.value; }
				default: { return false; }
			}
		}
		case "Text": {
			switch (filter.operation) {
				case 'IN': {
					return t.title.toLowerCase() === filter.value.toLowerCase() || t.body.toLowerCase() === filter.value.toLowerCase();
				}
				default: { return false; }
			}
		}
		case "Label": {
			switch (filter.operation) {
				case 'CONTAINS': {
					return t.labels.some(l => l.id === filter.value);
				}
				default: {
					return false;
				}
			}
		}
		default: {
			return false;
		}
	}
}

import type { Action } from "svelte/action";

export function patch(node: HTMLInputElement, { value, action, time }: { value: string, action?: Function, time?: number }) {
	let timeout: Timer | null = null;

	return {
		update() {
			if (timeout) { clearTimeout(timeout); }
			timeout = setTimeout(() => {
				if (action) {
					action(node.value);
				}
			}, time ?? 5000);
		},
		destroy() {
			if (timeout) {
				clearTimeout(timeout);
				if (action) {
					action(node.value);
				}
			}
		}
	};
}

import { Blocks, Bug, CalendarDays, CalendarFold, Circle, CircleArrowUp, CircleCheck, CircleHelp, CircleX, Clock3, ComponentIcon, Copy, DiamondPlus, Flag, Flame, Gift, GitBranch, GitPullRequestArrow, Hourglass, Inbox, MessagesSquare, Notebook, OctagonAlert, Pin, SignalHigh, SignalLow, SignalMedium, SquareCheck, SquareCheckBig, SquareX, Sunset, Timer, Trash, User, Users, View, Wifi, WifiHigh, WifiLow, WifiZero } from "lucide-svelte";
import type { Component } from "svelte";
import type { Efforts, Priorities, State, Value } from "./types";
import { createProductFeatureMutation, deleteFeatureMutation, deleteProductMutation, deleteProjectMutation, deleteTaskMutation, deleteToDoMutation, pinItemMutation } from "./state";
import type { QueryClient } from "@tanstack/svelte-query";
import { task, todo } from "./global.svelte.ts";
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

export const CLASSES = {
	"User": {
        icon: User,
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
        icon: Circle,
        url: (id?: string) => id ? `/tasks/${id}` : "/tasks",
		actions: [
			{
				label: "Create related ToDo",
				icon: SquareCheckBig,
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
		icon: SquareCheckBig,
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
		icon: DiamondPlus,
		url: (id?: string) => id ? `/features/${id}` : "/features",
		actions: [
			{
				label: "Create related ToDo",
				icon: SquareCheckBig,
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
	"Component": {
		icon: Blocks,
		url: (id?: string) => id ? `/components/${id}` : "/components",
		actions: [
			{
				label: "Create related ToDo",
				icon: SquareCheckBig,
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
		icon: Bug,
		url: (id?: string) => id ? `/bugs/${id}` : "/bugs",
	},
    "Channel": {
    	icon: MessagesSquare,
    	url: (id?: string) => id ? `/channels/${id}` : "/channels",
    },
    "Project": {
    	icon: Notebook,
    	url: (id?: string) => id ? `/projects/${id}` : "/projects",
		actions: [
			{
				label: "Tasks",
				icon: Circle,
				action: (queryClient: QueryClient, id: string) => goto(`/projects/${id}/tasks`),
			},
			{
				label: "Objective",
				icon: Flag,
				action: (queryClient: QueryClient, id: string) => goto(`/projects/${id}/objectives/active`),
			},
			{
				label: "Create related ToDo",
				icon: SquareCheckBig,
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
    	icon: Gift,
    	url: (id?: string) => id ? `/products/${id}` : "/products",
		actions: [
			{
				label: "Create related ToDo",
				icon: SquareCheckBig,
				action: (queryClient: QueryClient, id: string) => { todo.value = { related: { id, title: "" } } },
			},
			{
				label: "Pin",
				icon: Pin,
				action: (queryClient: QueryClient, id: string) => pinItemMutation(queryClient)(id),
			},
			{
				label: "Create related Feature",
				icon: DiamondPlus,
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
    	icon: View,
    	url: (id?: string) => id ? `/views/${id}` : "/views",
    },
	"Team": {
		icon: Users,
		url: (id?: string) => id ? `/teams/${id}` : "/teams",
	},
	"Repository": {
		icon: GitBranch,
		url: (id?: string) => id ? `/repositories/${id}` : "/repositories",
	},
	"Objective": {
		icon: Flag,
		url: (id?: string) => id ? `/objectives/${id}` : "/objectives",
		actions: [
			{
				label: "Tasks",
				icon: Circle,
				action: (queryClient: QueryClient, id: string) => goto(`/objectives/${id}/tasks`),
			},
			{
				label: "Create related ToDo",
				icon: SquareCheckBig,
				action: (queryClient: QueryClient, id: string) => { todo.value = { related: { id, title: "" } } },
			},
			{
				label: "Pin",
				icon: Pin,
				action: (queryClient: QueryClient, id: string) => pinItemMutation(queryClient)(id),
			},
			{
				label: "Create related Task",
				icon: Circle,
				action: (queryClient: QueryClient, id: string) => { task.value = { related: [{ id, }] } },
			},
			{
				label: "Make active",
				icon: Flame,
				action: (queryClient: QueryClient, id: string) => { task.value = { related: [{ id, }] } },
			}
			// {
			// 	label: "Delete",
			// 	icon: Trash,
			// 	action: (queryClient: QueryClient, id: string) => deleteObjectiveMutation(queryClient)(id),
			// }
		],
	},
	"MergeRequest": {
		icon: GitPullRequestArrow,
		url: (id?: string) => id ? `/merge-requests/${id}` : "/merge-requests",
	},
};

export const LINKS = [
    { href: "/", icon: Inbox, label: "Inbox" },
    { href: "/channels", icon: CLASSES["Channel"].icon, label: "Channels" },
    { href: "/projects", icon: CLASSES["Project"].icon, label: "Projects" },
    { href: "/products", icon: CLASSES["Product"].icon, label: "Products" },
    { href: "/views", icon: CLASSES["View"].icon, label: "Views" },
    { href: "/teams", icon: CLASSES["Team"].icon, label: "Teams" },
    { href: "/repositories", icon: CLASSES["Repository"].icon, label: "Repositories" },
    { href: "/merge-requests", icon: CLASSES["MergeRequest"].icon, label: "Merge Requests" },
];

export const COLORS = [
    {
        name: "Green/Light",
    },
    {
        name: "Orange/Light",
    },
];
