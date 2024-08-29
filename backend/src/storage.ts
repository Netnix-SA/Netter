export interface Storage {
	store(key: string, value: BinaryData): Promise<void>;
	read(key: string): Promise<BinaryData>;
};

export class LocalStorage implements Storage {
	async store(key: string, value: BinaryData) {
		await Bun.write(Bun.file(`/app/files/${key}`), value);
	}

	async read(key: string) {
		// return await Bun.file(`/app/files/${key}`);
	}
}
