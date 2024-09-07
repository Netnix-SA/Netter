export interface Events {
	publish<T>(topic: string, message: T): Promise<void>;
	get<T>(topic: string): Promise<T[]>;
};

export class LocalEvents implements Events {
	async publish<T>(topic: string, message: T) {
		console.log(topic, message);
	}

	async get<T>(topic: string) {
		return [];
	}
};

export class MemoryEvents implements Events {
	private topics: Record<string, any[]> = {};

	async publish<T>(topic: string, message: T) {
		if (!this.topics[topic]) {
			this.topics[topic] = [];
		}

		this.topics[topic].push(message);
	}

	async get<T>(topic: string) {
		return this.topics[topic] || [];
	}
};