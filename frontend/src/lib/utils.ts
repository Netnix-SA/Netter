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