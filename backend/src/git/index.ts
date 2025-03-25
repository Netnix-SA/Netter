interface Git {
	getRepositories(): Promise<GitRepository[]>;
}

interface GitRepository {
	getBranches(): Promise<string[]>;
}

interface GitBranch {
	getCommits(): Promise<GitCommit[]>;
}

interface GitCommit {
	getChanges(): Promise<GitChange[]>;
}

interface GitChange {
	getFile(): Promise<GitFile>;
}

interface GitFile {
	getContent(): Promise<string>;
}

import { $ } from "bun";

export class SSHGit implements Git {
	constructor(private readonly ssh: string) {
		this.ssh = ssh;
	}

	async getRepositories() {
		const repos = await $`ssh -vvv -i /app/key ${this.ssh} git ls-remote --heads`.text();

		console.log(repos);

		return repos.split("\n").map(repo => new SSHGitRepository(repo));
	}
}

class SSHGitRepository implements GitRepository {
	constructor(private readonly repo: string) {
		this.repo = repo;
	}

	async getBranches() {
		const branches = await $`ssh ${this.repo} git branch`.text();

		return branches.split("\n");
	}
}

class SSHGitBranch implements GitBranch {
	constructor(private readonly branch: string) {
		this.branch = branch;
	}

	async getCommits() {
		const commits = await $`ssh ${this.branch} git log`.text();

		return commits.split("\n").map(commit => new SSHGitCommit(commit));
	}
}

class SSHGitCommit implements GitCommit {
	constructor(private readonly commit: string) {
		this.commit = commit;
	}

	async getChanges() {
		const changes = await $`ssh ${this.commit} git diff`.text();

		return changes.split("\n").map(change => new SSHGitChange(change));
	}
}

class SSHGitChange implements GitChange {
	constructor(private readonly change: string) {
		this.change = change;
	}

	async getFile() {
		const file = await $`ssh ${this.change} git show`.text();

		return new SSHGitFile(file);
	}
}

class SSHGitFile implements GitFile {
	constructor(private readonly file: string) {
		this.file = file;
	}

	async getContent() {
		return this.file;
	}
}