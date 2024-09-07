export interface Storage {
	store(key: string, value: Uint8Array): Promise<void>;
	read(key: string): Promise<Uint8Array>;
};

export class LocalStorage implements Storage {
	async store(key: string, value: Uint8Array) {
		await Bun.write(`/app/files/${key}`, value);
	}

	async read(key: string) {
		const file = Bun.file(`/app/files/${key}`);
		return await file.bytes();
	}
}

export class MemoryStorage implements Storage {
	private files: Record<string, Uint8Array> = {};

	async store(key: string, value: Uint8Array) {
		this.files[key] = value;
	}

	async read(key: string) {
		return this.files[key];
	}
}